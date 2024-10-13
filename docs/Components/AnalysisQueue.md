# Analysis Queue

The Analysis Queue is a crucial component of our asynchronous image processing system, managing the workflow of image analysis tasks.

## Features and Functions

1. **Task Queueing**: 
   - Enqueues new image analysis tasks upon successful image upload.
   - Stores metadata about each task, including image ID, status, and timestamps.

2. **Status Tracking**: 
   - Maintains the current status of each analysis task (e.g., pending, in_progress, completed, failed).
   - Allows for easy monitoring of task progress.

3. **Priority Management**: 
   - (Future feature) Supports task prioritization to handle urgent analysis requests.

4. **Scalability**: 
   - Designed to handle a large number of concurrent tasks.
   - Supports horizontal scaling for increased processing capacity.

5. **Error Handling**: 
   - Tracks failed tasks and supports retry mechanisms.
   - Provides detailed error information for debugging purposes.

## Workflow

### Inputs
1. **New Image Upload**:
   - Image ID
   - User ID
   - Upload timestamp

### Process
1. **Enqueue**:
   - When a new image is uploaded, an entry is created in the `analysis_queue` table.
   - Initial status is set to 'pending'.

2. **Processing**:
   - The background worker polls the queue for pending tasks.
   - When a task is picked up, its status is updated to 'in_progress'.
   - The worker performs the analysis and updates the results.

3. **Completion**:
   - Upon successful completion, the task status is updated to 'completed'.
   - If an error occurs, the status is set to 'failed' with error details.

### Outputs
1. **Analysis Results**:
   - Stored in the `analysis_results` table.
   - Linked to the original image via `image_id`.

2. **Updated Image Status**:
   - The `images` table is updated with the latest analysis status.

## Database Schema

```sql
CREATE TABLE analysis_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES images(id),
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Considerations

1. **Performance**:
   - Index the `status` and `created_at` columns for efficient querying.
   - Consider partitioning the table if it grows very large.

2. **Concurrency**:
   - Implement locking mechanisms to prevent multiple workers from processing the same task.
   - Use database transactions to ensure data consistency during status updates.

3. **Monitoring**:
   - Implement logging and monitoring to track queue length, processing times, and error rates.
   - Set up alerts for abnormal conditions (e.g., queue growing too large, high failure rate).

4. **Retry Logic**:
   - Implement an exponential backoff strategy for retrying failed tasks.
   - Set a maximum retry limit to prevent endless retries of persistently failing tasks.

5. **Cleanup**:
   - Implement a periodic cleanup job to archive or delete old completed or failed tasks.

6. **Security**:
   - Ensure that the queue can only be accessed by authorized services and users.
   - Implement audit logging for all queue operations.

7. **Scalability**:
   - Design the system to allow for multiple worker processes to handle increased load.
   - Consider using a distributed queue system (e.g., Redis) if Supabase's PostgreSQL queue becomes a bottleneck.

8. **User Experience**:
   - Provide real-time updates to users about their image analysis status.
   - Consider implementing estimated completion times for better user feedback.

By carefully considering these aspects, we can ensure that our Analysis Queue is robust, efficient, and scalable, providing a smooth experience for users while handling complex image analysis tasks in the background.

