## Create Tables

```sql
-- Setup pgvector extension first
CREATE EXTENSION IF NOT EXISTS vector;

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_analyzed TIMESTAMP WITH TIME ZONE,
  embedding VECTOR(1536),
  thumbnail_path TEXT,
  analysis_status TEXT DEFAULT 'unprocessed',
  objects TEXT[],
  text_detected TEXT[],
  people TEXT,
  landmarks TEXT[],
  scene_description TEXT,
  qualitative_aspects TEXT
);

-- User_Roles table
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  can_upload BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false
);


```

## Create Indexes

```sql
-- Indexes for Images table
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_embedding ON images USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_images_analysis_status ON images(analysis_status);
```

## Create Functions

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE OR REPLACE FUNCTION match_images(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  current_user_id UUID
)
RETURNS TABLE (
  id UUID,
  file_path TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    images.id, 
    images.file_path, 
    1 - (images.embedding <=> query_embedding) AS similarity
  FROM images
  WHERE 
    images.user_id = current_user_id
    AND images.embedding IS NOT NULL
    AND 1 - (images.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

## Create RLS Policies

```
-- Enable RLS on all tables
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Images table policies
CREATE POLICY "Users can insert their own images" ON images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own images" ON images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own images" ON images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own images" ON images FOR DELETE USING (auth.uid() = user_id);

-- User_roles table policies
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can insert user roles" ON user_roles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "Only admins can update user roles" ON user_roles FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true));
CREATE POLICY "Only admins can delete user roles" ON user_roles FOR DELETE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true));

```
