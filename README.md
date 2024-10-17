# 🖼️ Picky: AI-Powered Image Gallery

![Picky Screenshot](https://github.com/tsekula/Picky-Next/blob/master/public/images/Picky%20Screenshot.jpg)
## 🌟 Project Overview

### 🤔 What is Picky?
Picky is an online image gallery designed to manage and search through a user's extensive library of digital photos. The app's unique selling point is its ability to search and filter images based on natural language queries, including the names of people in the images. Picky delivers relevant images quickly and accurately by leveraging a combination of advanced concepts and AI tools, such as machine vision, vector or graph databases, and Large Language Models (LLMs). Each user has their own private account and gallery, ensuring a personalized and secure experience.
### 🎯 Why was Picky built?
I wanted to give a talk to [my local AI meetup group](https://www.meetup.com/heidelberg-ai-community/) about using AI at every step of the development process. For this talk, I created this challenge:
- Go from an idea to a running, end-to-end proof-of-concept
- Use AI-assisted tools from conception to delivery
- Use modern technologies that I am NOT familiar with:
  - Full-stack Next.js project
  - IDE with AI capabilities
  - Vector database
- **_Not write a single line of code!!!_**🤯
- Document the process along the way
- Do this in ~1 week

Picky was the use case I settled on. You can [check out the resulting slide deck I presented](https://docs.google.com/presentation/d/1ojmVBc2vzR_AOz46Da5bqfTFf-okOvVnIIPGR74M_rg/edit?usp=sharing).

### 🧠 Technical Concepts Explored
- Using a IDE with integrated AI capabilities ([Cursor](https://www.cursor.com/)) to 💯% create, refactor, and troubleshoot code
- Using a LLM (Claude 3.5 Sonnet) to generate various artifacts through the project, e.g. project plans, architectural design, code, documentation
- Using a LLM (GPT-4o) + accompanying [prompt engineering](src/config/llmconfig.js) for the computer vision tasks needed to analyze images
- Using a LLM (OpenAI) for generating embeddings for semantic search
- Using a vector database (pgvector in Supabase) for storing and querying embeddings

### 🛠️ Tech Stack
- Next.js full-stack app with Tailwind CSS
- Supabase with pgvector

### 🔑 Key Features of Picky
The full scope is shown below, but time constraints limited what I was able to implement.

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


## 🚀 Getting Started

### 💻 Installing the app locally
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
### 🏁 Launching the app
To start the app's backend server, run this command from the /Picky-Next folder:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 🖱️ Using the app
Upon launching the app, you will be redirected to the login page. Use the 'sign-in account' you created in the setup steps above to log in.

Once logged in, you'll see the image gallery. By default it will be empty, so you'll need to upload some images. Click on the '+' button in the nav and the upload area will appear.  You can use it to upload 1 or more images at once.

After uploading images, the gallery will refresh to display the newly uploaded images.  You can click any image to see a larger version, along with the current metadata.  **Important:** Only basic info about the image (name, date uploaded, file type) will appear at this point.

To perform the full computer vision analysis, you have to manually trigger it. Click on the purple 🪄 button to initiate the analysis of _all unprocessed images_. This analysis will take 2-10 seconds for each 1 image, so be patient. There is no indicator that the analysis is complete 😳 (I just didn't implement it -- sorry).  You can go check the 'images' table in Supabase to see the status for each image change '_unprocessed_' -> '_pending_' -> '_complete_'.

To check the result of the computer vision analysis, click on an image to see a larger version. The metadata will be updated with the results of the computer vision analysis.

Now you can conduct a semantic search. Enter a search query in the text box and click 'Search' to see a filtered list of images that match the search query.  Click the 'X' to reset the search.
