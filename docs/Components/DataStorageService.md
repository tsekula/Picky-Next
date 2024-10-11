# Data Storage Service

## Overview
The Data Storage Service manages the storage and retrieval of user data, image data, metadata, and analysis results. It ensures data isolation between different user accounts.

## Challenges
- Designing an efficient schema for quick retrieval
- Implementing vector storage for semantic search capabilities
- Ensuring data isolation and security between user accounts

## Interactions
- Receives data from User Authentication, Image Upload, Image Analysis, and Facial Recognition Services
- Provides data to the Search Service and Gallery View Component

## Decisions made

1. **Database Type:**
   - Relational: PostgreSQL via Supabase
   - Leverages pgvector for vector storage and similarity search

2. **Vector Storage Solution:**
   - pgvector extension provided by Supabase for PostgreSQL

3. **File Storage:**
   - Supabase Storage (object storage similar to S3)

4. **Caching Strategy:**
   - Utilize Supabase's built-in caching mechanisms
   - Consider adding Redis for additional caching if needed

5. **Data Partitioning:**
   - Utilize PostgreSQL's partitioning features for large tables

6. **Backup and Redundancy:**
   - Automatic backups provided by Supabase
   - Point-in-time recovery available

7. **Access Control:**
   - Implement Row Level Security (RLS) policies in Supabase
   - Utilize Supabase Auth for user authentication

## Database Schema

### Images Table
- `id`: UUID (Primary Key, Default: uuid_generate_v4())
- `user_id`: UUID (Foreign Key to User table)
- `file_path`: TEXT (Not Null)
- `file_name`: TEXT (Not Null)
- `file_size`: INTEGER (Not Null)
- `mime_type`: TEXT (Not Null)
- `uploaded_at`: TIMESTAMP WITH TIME ZONE (Default: CURRENT_TIMESTAMP)
- `last_analyzed`: TIMESTAMP WITH TIME ZONE
- `embedding`: VECTOR (using pgvector)

### Tags Table
- `id`: UUID (Primary Key, Default: uuid_generate_v4())
- `name`: TEXT (Not Null, Unique)
- `category`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE (Default: CURRENT_TIMESTAMP)

### Image_Tags Table
- `image_id`: UUID (Foreign Key to Images table)
- `tag_id`: UUID (Foreign Key to Tags table)
- `confidence_score`: DOUBLE PRECISION
- `created_at`: TIMESTAMP WITH TIME ZONE (Default: CURRENT_TIMESTAMP)

### Analysis_Results Table
- `id`: UUID (Primary Key, Default: uuid_generate_v4())
- `image_id`: UUID (Foreign Key to Images table)
- `analysis_type`: TEXT (Not Null)
- `result`: JSONB (Not Null)
- `created_at`: TIMESTAMP WITH TIME ZONE (Default: CURRENT_TIMESTAMP)

### User_Roles Table
- `user_id`: UUID (Primary Key, Foreign Key to User table)
- `can_upload`: BOOLEAN (Default: false)
- `is_admin`: BOOLEAN (Default: false)

## Setup and Initialization

1. **Supabase Project Setup:**
   - Create a new Supabase project
   - Configure project settings and obtain API keys

2. **Database Schema Implementation:**
   - Use Supabase's SQL editor to create the tables as defined above
   - Ensure proper indexing for frequently queried columns

3. **Vector Storage Setup:**
   - Enable pgvector extension in Supabase
   - Create vector columns for similarity search (e.g., `embedding` in Images table)

4. **File Storage Configuration:**
   - Set up Supabase Storage buckets for image files
   - Configure access policies for secure file management

5. **API Development:**
   - Utilize auto-generated APIs for basic CRUD operations
   - Create custom Postgres functions for complex queries
   - Implement Edge Functions for additional backend logic

6. **Data Migration (if applicable):**
   - Develop scripts to migrate existing data to the new schema

7. **Monitoring and Logging:**
   - Set up monitoring tools for database performance
   - Implement logging for all data operations

8. **Backup System:**
   - Configure automated backups
   - Test backup and restore procedures

9. **Scaling Preparation:**
   - Set up database replication if needed
   - Configure load balancing for API servers

10. **Integration Testing:**
    - Develop and run integration tests with other services (User Authentication, Image Upload, Image Analysis, etc.)

11. **Documentation:**
    - Create comprehensive documentation for the Data Storage Service API
    - Document database schema and any special procedures

12. **Security Measures:**
    - Implement encryption for sensitive data
    - Set up firewalls and network security rules
    - Ensure proper data isolation between user accounts using Row Level Security