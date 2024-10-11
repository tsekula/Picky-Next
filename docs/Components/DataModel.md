# Data Model

This document outlines the data model for our AI-powered image analysis and tagging system. We're using Supabase with PostgreSQL as our relational database, leveraging its built-in features for authentication, storage, and vector embeddings.

## Entities

### User
- `id`: UUID (primary key, provided by Supabase Auth)
- `email`: STRING (unique)
- `created_at`: TIMESTAMP
- `last_login`: TIMESTAMP

### UserRole
- `user_id`: UUID (primary key, foreign key to User)
- `can_upload`: BOOLEAN
- `is_admin`: BOOLEAN

### Image
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to User)
- `file_path`: STRING
- `file_name`: STRING
- `file_size`: INTEGER
- `mime_type`: STRING
- `uploaded_at`: TIMESTAMP
- `last_analyzed`: TIMESTAMP
- `embedding`: VECTOR (using pgvector)

### Tag
- `id`: UUID (primary key)
- `name`: STRING (unique)
- `category`: STRING
- `created_at`: TIMESTAMP

### ImageTag
- `image_id`: UUID (foreign key to Image)
- `tag_id`: UUID (foreign key to Tag)
- `confidence_score`: FLOAT
- `created_at`: TIMESTAMP

### AnalysisResult
- `id`: UUID (primary key)
- `image_id`: UUID (foreign key to Image)
- `analysis_type`: STRING (e.g., 'object_detection', 'sentiment_analysis')
- `result`: JSONB
- `created_at`: TIMESTAMP

## Relationships

1. A User can have many Images (one-to-many)
2. An Image can have many Tags through ImageTag (many-to-many)
3. A Tag can be associated with many Images through ImageTag (many-to-many)
4. An Image can have many AnalysisResults (one-to-many)

## Indexes

1. `Image.user_id`: For quick lookup of a user's images
2. `Image.embedding`: GiST index for efficient similarity search
3. `ImageTag.image_id` and `ImageTag.tag_id`: For efficient joining
4. `Tag.name`: For quick tag lookups
5. `AnalysisResult.image_id`: For quick lookup of an image's analysis results

## Notes

- The `User` table leverages Supabase Auth, which provides additional fields and functionality.
- The `Image.embedding` field uses pgvector to store vector representations of images for similarity search.
- The `AnalysisResult.result` field uses JSONB to store flexible, schema-less data for different types of analysis results.
- Consider using Supabase's Row Level Security (RLS) policies to ensure users can only access their own data.

## Future Considerations

1. Implement a `Category` table if tag categories become more complex.
2. Add a `SharedImage` table if image sharing functionality is needed.
3. Consider versioning for `AnalysisResult` if we need to track changes in analysis over time.