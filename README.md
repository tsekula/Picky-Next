# Picky: AI-Powered Image Gallery

## Project Overview

Picky is an online image gallery designed to manage and search through a user's extensive library of digital photos. The app's unique selling point is its ability to search and filter images based on natural language queries, including the names of people in the images. Picky delivers relevant images quickly and accurately by leveraging a combination of advanced concepts and AI tools, such as machine vision, vector or graph databases, and Large Language Models (LLMs). Each user has their own private account and gallery, ensuring a personalized and secure experience.

## Tech Stack

### Front-end and Back-end
- Next.js full-stack app
- Tailwind CSS
- Supabase with pgvector
- OPenAI ChatGPT API

## Key Features

1. **User Authentication**: Users can sign up, log in, and reset their passwords. Each user has their own private gallery.

2. **Image Upload**: Users can select and add images to their personal gallery.

3. **Image Analysis**: Each uploaded image is analyzed for:
   - Objects (including text, inanimate objects, people, landmarks)
   - Scene detection
   - Qualitative aspects (description of what the image is showing)

4. ~**Manual Metadata**: Users can manually add additional metadata, such as:~
   - ~Geolocation where the photo was taken~
   - ~Names of people appearing in the photo~

5. **Data Persistence**: All image data is stored in an optimal database for natural language searching (e.g., vector database for RAG-style querying).

6. ~**Facial Recognition**: The system can perform facial recognition to:~
   - ~Match faces with known people in the datastore~
   - ~Automatically tag people in new photos~

7. **Gallery View**: A user interface allows browsing through all images in a masonry-style layout within the user's private gallery.

8. **Semantic Search**: Users can ~speak or~ type requests, and the system will:
   - Execute a semantic search
   - Identify images matching the query
   - Display a filtered list in a masonry-style layout

9. ~**User Account Management**: Users can manage their account settings, update profile information, and control privacy settings.~

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
