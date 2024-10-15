# Image Analysis API Routes

This document describes the API routes for image analysis operations in our application.

## Overview

The `analysis/route.js` file handles API routes for image analysis operations. It includes functions to retrieve, create, and delete analysis results. The file uses Supabase for authentication and database operations.

## Routes

### GET /api/analysis

Retrieves analysis results for a specific image.

#### Input
- Query parameter: `imageId` (string)

#### Output
- Success: JSON response with analysis results
- Error: JSON response with error message

#### Authentication
Requires a valid user session.

### POST /api/analysis

Processes and saves analysis for a given image.

#### Input
- Request body: `{ image_id: string }`
- Header: `Authorization: Bearer <token>`

#### Output
- Success: JSON response with saved analysis result
- Error: JSON response with error message

#### Authentication
Requires a valid Bearer token in the Authorization header.

#### Process
1. Verifies the user token
2. Updates the image analysis status to 'pending'
3. Retrieves and resizes the image
4. Analyzes the image
5. Saves the analysis results
6. Updates the image analysis status to 'complete'

### DELETE /api/analysis

Deletes a specific analysis result.

#### Input
- Query parameter: `id` (string)

#### Output
- Success: JSON response confirming deletion
- Error: JSON response with error message

#### Authentication
Requires a valid user session.

## Error Handling

All routes include error handling for:
- Authentication failures
- Database operation errors
- Image processing errors

Errors are returned as JSON responses with appropriate HTTP status codes.

## Dependencies

- @supabase/auth-helpers-nextjs
- @supabase/supabase-js
- next/headers
- next/server
- sharp
- openai

## External Services

- Supabase: Used for authentication and database operations
- OpenAI: Used for image analysis (implied from the imports)

## Note

Ensure that all required environment variables are set, including Supabase URL and API keys, and OpenAI API key if used.

