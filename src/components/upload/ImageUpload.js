'use client'

import { useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ImageUpload({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClientComponentClient()

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    if (!uploading) setDragging(true)
  }, [uploading])

  const handleDragLeave = useCallback(() => {
    if (!uploading) setDragging(false)
  }, [uploading])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    if (uploading) return
    setDragging(false)
    const files = e.dataTransfer.files
    await uploadFiles(files)
  }, [uploading])

  const handleFileInput = useCallback(async (e) => {
    if (uploading) return
    const files = e.target.files
    await uploadFiles(files)
  }, [uploading])

  const uploadFiles = async (files) => {
    setUploading(true);
    setProgress(0);
    const formData = new FormData();

    for (const file of files) {
      if (file.type === 'image/heic') {
        alert('HEIC files are not supported. Please select a different image format.');
        setUploading(false);
        setProgress(0);
        return;
      }
      formData.append('files', file);
    }

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      };

      xhr.onload = async function() {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          console.log('Files uploaded successfully');
          if (result.uploadedImages && result.uploadedImages.length > 0) {
            onUploadSuccess(result.uploadedImages);
          } else {
            console.error('No uploaded images returned from the server');
          }
        } else {
          console.error('Upload failed');
        }
        setUploading(false);
        setProgress(0);
      };

      xhr.onerror = function() {
        console.error('Error uploading files');
        setUploading(false);
        setProgress(0);
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-8 text-center ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {uploading ? (
        <div>
          <p>Uploading... {progress.toFixed(0)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
          </div>
        </div>
      ) : (
        <>
          <p>Drag and drop images here, or click to select files</p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Select Files
          </label>
        </>
      )}
    </div>
  )
}
