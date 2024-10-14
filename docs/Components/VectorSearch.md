Stored Procedure for Vector Search
```
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

```