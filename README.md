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


## Getting Started

### Installing the app locally
Pre-requisites:
- [Git installed locally](https://github.com/git-guides/install-git)
- [Node.js + NPM installed on your local machine](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-installer-to-install-nodejs-and-npm)
- [A free Supabase account](https://supabase.com)
- [An OpenAI account](https://platform.openai.com/)

1. Create a new base directory for your code projects, e.g. 'Code'.
2. From a terminal go into that 'Code' directory and pull down the code via
   ```
   git clone https://github.com/tsekula/Picky-Next.git
   ```
   This will create a new sub-directory named 'Picky-Next'.
4. Go into that 'Picky-Next' directory and install the app + its dependencies by running this command:
   ```
   npm install
   ```
5. Create a new Supabase project by following the steps at [https://database.new/](https://database.new/). Name the project `Picky`.

   While it's setting up the project, copy-and-paste these values into your local `/.env` file and save:
   ```
   NEXT_PUBLIC_SUPABASE_URL=XXXXXXXXX     // 'Project URL' in Supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=XXXXXX   // 'anon public' Project API Keys in Supabase
   ```
   You can find these values via the '_Project Settings_' -> '_API_' section in the [Supabase dashboard](https://supabase.com/dashboard/projects) for your project
6. Set up the Supabase storage
   1. From the [Supabase dashboard](https://supabase.com/dashboard/projects) for your project click on '_Storage_' in the left nav bar.
   2. In the upper-left, click the '_New Bucket_' button and enter '_images_' as the name of the bucket. Click '_Save_'
   3. Create another bucket named '_thumbnails_', **important:** set this bucket to 'Public bucket'!
7. Set up the Supabase database.
   1. From the [Supabase dashboard](https://supabase.com/dashboard/projects) for your project click on '_SQL Editor_' in the left nav bar
   2. In the upper-left, next to the '_Search queries..._' input box, click the '+' symbol and then click '_Create a new snippet_'.
   3. **Create the tables:** In the text editor window, copy-and-paste the script from the ['Create Tables' section of this page](https://github.com/tsekula/Picky-Next/blob/master/docs/Setup/SupabaseScripts.md#create-tables). Click the green 'Run' button to execute the script. You should see a `Success. No rows returned` message confirming the action.
   4. **Create the indexes:** In the same text editor window, delete the existing text. Copy-and-paste the script from the ['Create Indexes' section of this page](https://github.com/tsekula/Picky-Next/blob/master/docs/Setup/SupabaseScripts.md#create-indexes). Run the script. You should see a `Success. No rows returned` message confirming the action.
   5. **Create the match function:** In the same text editor window, delete the existing text. Copy-and-paste the script from the ['Create Functions' section of this page](https://github.com/tsekula/Picky-Next/blob/master/docs/Setup/SupabaseScripts.md#create-functions). Run the script. You should see a `Success. No rows returned` message confirming the action.
   6. **Create the Row Level Security (RLS) policies:** In the same text editor window, delete the existing text. Copy-and-paste the script from the ['Create RLS Policies' section of this page](https://github.com/tsekula/Picky-Next/blob/master/docs/Setup/SupabaseScripts.md#create-rls-policies). Run the script. You should see a `Success. No rows returned` message confirming the action.
   7. **Create the Storage policies:** In the same text editor window, delete the existing text. Copy-and-paste the script from the ['Create Storage Policies' section of this page](https://github.com/tsekula/Picky-Next/blob/master/docs/Setup/SupabaseScripts.md#create-storage-policies). Run the script. You should see a `Success. No rows returned` message confirming the action.
8. Set up your image gallery sign-in account in Supabase
   1. From the [Supabase dashboard](https://supabase.com/dashboard/projects) for your project click on '_Authentication_' in the left nav bar.
   2. On the '_Users_' screen, click the green '_Add user_' button on the far right, then '_Create new user_'. Enter an email address and password that you will use to login to your image gallery.  Click '_Create User_'.
   3. In the left nav bar click '_Table Editor_', then click on the '_user_roles_' table name. Click the green '_Insert_' button, then '_Insert row_'. For the 'user_id' field, click '_Select record_', then in the pop-up choose the 1 and only record shown. Set '_can_upload_' to `TRUE`. Click '_Save_'.
9. Add your OpenAI API key
   1. Create a new API key via [the OpenAI dashboard](https://platform.openai.com/api-keys). Make sure permissions are set to 'All'.
   2. Copy-and-paste the new API key into your local `/.env` file and save:
      ```
      OPENAI_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXX
      ```
### Launching the app
To start the app's backend server, run this command from the /Picky-Next folder:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

