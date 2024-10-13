# Picky: Component Breakdown

## Components

### 1. User Authentication Service
- **Functionality**: Handles user registration, login, and password reset.
- **Challenges**: 
  - Implementing secure authentication practices
  - Managing user sessions and tokens
- **Interactions**: 
  - Communicates with the Data Storage Service to store and retrieve user information
  - Integrates with the User Interface Component for login/signup forms
- **Implementation**: 
  - Utilizes Supabase Authentication for secure user management

### 2. Image Upload Service
- **Functionality**: Handles image selection and uploading to the server.
- **Challenges**: 
  - Handling large file sizes and multiple uploads
  - Ensuring secure file transfer
- **Interactions**: 
  - Sends uploaded images to the Data Storage Service
  - Queues images for analysis by the Image Analysis Service
- **Implementation**: 
  - Uses Supabase Storage for secure file storage
  - Implements client-side image resizing for thumbnails

### 3. Image Analysis Service
- **Functionality**: Asynchronously analyzes uploaded images for objects, text, people, landmarks, and scene detection.
- **Challenges**: 
  - Integrating and optimizing multiple AI models for different analysis tasks
  - Ensuring accuracy across diverse image types
  - Managing asynchronous processing of images
- **Interactions**: 
  - Processes images queued by the Image Upload Service
  - Sends analysis results to the Data Storage Service
- **Implementation**: 
  - Runs as a separate background worker process
  - Utilizes a queue system for managing pending analyses

### 4. Facial Recognition Service
- **Functionality**: Identifies and tags known individuals in images.
- **Challenges**: 
  - Achieving high accuracy in face detection and matching
  - Handling privacy concerns and consent for facial recognition
- **Interactions**: 
  - Works with the Image Analysis Service
  - Updates person tags in the Data Storage Service
- **Implementation**: 
  - To be determined based on privacy considerations and user needs

### 5. Data Storage Service
- **Functionality**: Manages the storage and retrieval of user data, image data, metadata, and analysis results.
- **Challenges**: 
  - Designing an efficient schema for quick retrieval
  - Implementing vector storage for semantic search capabilities
  - Ensuring data isolation between different user accounts
- **Interactions**: 
  - Receives data from User Authentication, Image Upload, Image Analysis, and Facial Recognition Services
  - Provides data to the Search Service and Gallery View Component
- **Implementation**: 
  - Uses Supabase (PostgreSQL) for relational data storage
  - Utilizes pgvector for vector embeddings and similarity search
- **Detailed Documentation**: 
  - [Data Storage Service](./components/DataStorageService.md)
  - [Data Model](./components/DataModel.md)

### 6. Search Service
- **Functionality**: Processes natural language queries and returns relevant image results within a user's private gallery.
- **Challenges**: 
  - Implementing efficient semantic search algorithms
  - Handling complex queries that combine multiple search criteria
- **Interactions**: 
  - Queries the Data Storage Service
  - Provides results to the User Interface Component
- **Implementation**: 
  - Leverages pgvector for semantic search capabilities

### 7. Gallery View Component
- **Functionality**: Displays images in a masonry-style layout and handles user interactions within their private gallery.
- **Challenges**: 
  - Implementing smooth infinite scrolling
  - Optimizing image loading for performance
  - Displaying analysis status for each image
- **Interactions**: 
  - Fetches image data from the Data Storage Service
  - Displays results from the Search Service
- **Implementation**: 
  - Uses React-Masonry-CSS for layout
  - Implements lazy loading for optimized performance

### 8. User Interface Component
- **Functionality**: Manages overall user interaction, including authentication, search input, and results display.
- **Challenges**: 
  - Creating an intuitive and responsive design
  - Implementing voice input for search queries
- **Interactions**: 
  - Communicates with all other components to coordinate user actions and display results
- **Implementation**: 
  - Built with Next.js for server-side rendering and optimal performance
  - Uses Tailwind CSS for responsive design

### 9. Metadata Management Component
- **Functionality**: Allows users to manually add or edit metadata for images in their private gallery.
- **Challenges**: 
  - Designing a user-friendly interface for efficient metadata entry
  - Ensuring data consistency and validation
- **Interactions**: 
  - Updates information in the Data Storage Service
  - Integrates with the Gallery View Component for inline editing
- **Implementation**: 
  - To be developed as part of the Gallery View Component

## Recommended Development Order

1. User Authentication Service
2. Data Storage Service
3. Image Upload Service
4. Gallery View Component
5. Image Analysis Service (including asynchronous processing)
6. Search Service
7. User Interface Component
8. Facial Recognition Service (if implemented)
9. Metadata Management Component

This order allows for a gradual build-up of functionality, starting with core features like user authentication and progressively adding more complex AI-driven capabilities. The asynchronous Image Analysis Service can be developed alongside other components, as it operates independently after images are uploaded.
