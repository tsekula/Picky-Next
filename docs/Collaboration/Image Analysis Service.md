# Prompt
```
The Image Analysis Service should be handled asynchronously from the image upload. The image upload and refresh on the client app should happen independent of the running of the image analysis. can you describe at a high level how our app would be updated to accommodate the image analysis service?
```

# Image Analysis Service

## High-Level Overview

The Image Analysis Service is designed to process images asynchronously, separate from the image upload process. This approach ensures a smooth user experience during upload while allowing for complex analysis tasks to be performed in the background.

## Key Components

1. **Image Upload Process**:
   - Remains largely unchanged, focusing on quick file transfer and storage.
   - After successful upload, the image is queued for analysis instead of being processed immediately.

2. **Analysis Queue**:
   - Implemented as a new table in our Supabase PostgreSQL database: `analysis_queue`.
   - Each queue item contains the image ID, timestamp, and status.

3. **Background Worker**:
   - Runs as a separate process, possibly implemented as a serverless function or a dedicated microservice.
   - Continuously polls the `analysis_queue` table for new tasks.
   - Performs image analysis using AI models (specific models to be determined based on requirements).

4. **Database Schema Updates**:
   - New `analysis_queue` table structure:
     ```sql
     CREATE TABLE analysis_queue (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       image_id UUID REFERENCES images(id),
       status TEXT DEFAULT 'pending',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     ```
   - Updated `images` table to include analysis status:
     ```sql
     ALTER TABLE images ADD COLUMN analysis_status TEXT DEFAULT 'pending';
     ```

5. **API Updates**:
   - Modified `/api/upload` endpoint to add newly uploaded images to the analysis queue.
   - New `/api/analysis/status` endpoint to check the analysis status of an image.

6. **Frontend Updates**:
   - Gallery view now displays analysis status for each image.
   - Implemented polling mechanism to update analysis status periodically.

## Implementation Details

### Background Worker Process

The background worker is implemented as a serverless function that runs on a schedule (e.g., every minute). It performs the following steps:

1. Query the `analysis_queue` table for pending tasks.
2. For each pending task:
   - Update the status to 'in_progress'.
   - Perform image analysis (object detection, text recognition, etc.).
   - Store results in the `analysis_results` table.
   - Update the image's `analysis_status` to 'completed'.
   - Remove the task from the `analysis_queue`.

### Analysis Results Storage

Analysis results are stored in the `analysis_results` table:

```sql
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES images(id),
  analysis_type TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend Integration

The `ImageGallery` component has been updated to display analysis status:

```javascript
const ImageGallery = () => {
  // ... existing code ...

  useEffect(() => {
    const pollAnalysisStatus = setInterval(async () => {
      const updatedImages = await fetchImagesWithStatus();
      setImages(updatedImages);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollAnalysisStatus);
  }, []);

  // ... render code ...
};
```

## Next Steps

1. Finalize the selection of AI models for image analysis tasks.
2. Implement error handling and retries in the background worker.
3. Optimize the polling mechanism to reduce unnecessary API calls.
4. Implement a user interface for viewing detailed analysis results.

This asynchronous approach allows for scalable image processing without impacting the user experience during upload and browsing.
