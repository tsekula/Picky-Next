Tables in the database:

```
Schema for table: images
Columns:
  id:
    Type: uuid
    Nullable: NO
    Default: uuid_generate_v4()
  user_id:
    Type: uuid
    Nullable: YES
    Default: None
  file_path:
    Type: text
    Nullable: NO
    Default: None
  file_name:
    Type: text
    Nullable: NO
    Default: None
  file_size:
    Type: integer
    Nullable: NO
    Default: None
  mime_type:
    Type: text
    Nullable: NO
    Default: None
  uploaded_at:
    Type: timestamp with time zone
    Nullable: YES
    Default: CURRENT_TIMESTAMP
  last_analyzed:
    Type: timestamp with time zone
    Nullable: YES
    Default: None
  embedding:
    Type: USER-DEFINED
    Nullable: YES
    Default: None
----------------------------------------

Schema for table: tags
Columns:
  id:
    Type: uuid
    Nullable: NO
    Default: uuid_generate_v4()
  name:
    Type: text
    Nullable: NO
    Default: None
  category:
    Type: text
    Nullable: YES
    Default: None
  created_at:
    Type: timestamp with time zone
    Nullable: YES
    Default: CURRENT_TIMESTAMP
----------------------------------------

Schema for table: image_tags
Columns:
  image_id:
    Type: uuid
    Nullable: NO
    Default: None
  tag_id:
    Type: uuid
    Nullable: NO
    Default: None
  confidence_score:
    Type: double precision
    Nullable: YES
    Default: None
  created_at:
    Type: timestamp with time zone
    Nullable: YES
    Default: CURRENT_TIMESTAMP
----------------------------------------

Schema for table: analysis_results
Columns:
  id:
    Type: uuid
    Nullable: NO
    Default: uuid_generate_v4()
  image_id:
    Type: uuid
    Nullable: YES
    Default: None
  analysis_type:
    Type: text
    Nullable: NO
    Default: None
  result:
    Type: jsonb
    Nullable: NO
    Default: None
  created_at:
    Type: timestamp with time zone
    Nullable: YES
    Default: CURRENT_TIMESTAMP
----------------------------------------

Schema for table: user_roles
Columns:
  user_id:
    Type: uuid
    Nullable: NO
    Default: None
  can_upload:
    Type: boolean
    Nullable: YES
    Default: false
  is_admin:
    Type: boolean
    Nullable: YES
    Default: false
----------------------------------------
```