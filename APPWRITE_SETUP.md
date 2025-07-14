# Appwrite Setup Guide for Bud AI

This guide will walk you through setting up a new Appwrite project for the Bud AI application. Follow these steps carefully to ensure the backend database and chat functionality work correctly.

## Step 1: Create a New Appwrite Cloud Project

1.  Go to [cloud.appwrite.io](https://cloud.appwrite.io/) and sign in or create an account.
2.  Click **"Create project"**.
3.  Name your project (e.g., `Bud AI`) and click **"Create"**.
4.  Once the project is created, navigate to the **"Platforms"** tab in the main dashboard sidebar.
5.  Click **"Add a platform"** and select **"New Web App"**.
6.  Give it a name (e.g., `Bud Frontend`).
7.  For the **Hostname**, enter `localhost`. This is crucial for local development to work.
8.  Click **"Next"** and then **"Skip optional step"**. You are now back on the Platforms page.

## Step 2: Create the Database and Collections

You need to create one database and two collections: one for `products` and one for `chat_history`.

### A. Create the Database

1.  In the left sidebar of your Appwrite project, click on **"Databases"**.
2.  Click **"Create database"**.
3.  Name the database `bud_db` and click **"Create"**.

### B. Create the "Products" Collection

1.  Inside your `bud_db` database, click **"Create collection"**.
2.  Name the collection `products` and click **"Create"**.
3.  Navigate to the **"Attributes"** tab for your new `products` collection.
4.  Add the following attributes:
    *   **Attribute ID:** `user_id`, **Type:** `String`, **Size:** `255`, check **Required**.
    *   **Attribute ID:** `name`, **Type:** `String`, **Size:** `255`, check **Required**.
    *   **Attribute ID:** `description`, **Type:** `String`, **Size:** `10000`, check **Required**.
    *   **Attribute ID:** `price`, **Type:** `String`, **Size:** `50`, check **Required**.
    *   **Attribute ID:** `image_url`, **Type:** `String`, **Size:** `2048`.
5.  Navigate to the **"Settings"** tab for the `products` collection.
6.  Under **"Permissions"**, click **"Add role"**. Select **"Any"**.
7.  Check the boxes to grant `Create`, `Read`, `Update`, and `Delete` permissions. This allows any user to manage their own products. For a production app, you would configure more granular user-specific permissions.
8.  Click **"Update"**.

### C. Create the "Chat History" Collection

1.  Go back to your `bud_db` database view.
2.  Click **"Create collection"**.
3.  Name the collection `chat_history` and click **"Create"**.
4.  Navigate to the **"Attributes"** tab for your new `chat_history` collection.
5.  Add the following attributes:
    *   **Attribute ID:** `user_id`, **Type:** `String`, **Size:** `255`, check **Required**.
    *   **Attribute ID:** `session_id`, **Type:** `String`, **Size:** `255`, check **Required**.
    *   **Attribute ID:** `type`, **Type:** `String`, **Size:** `50` (e.g., 'user', 'bot'), check **Required**.
    *   **Attribute ID:** `content`, **Type:** `String`, **Size:** `10000`, check **Required**.
6.  Navigate to the **"Settings"** tab for the `chat_history` collection.
7.  Under **"Permissions"**, click **"Add role"**. Select **"Any"**.
8.  Check the boxes to grant `Create`, `Read`, `Update`, and `Delete` permissions.
9.  Click **"Update"**.

## Step 3: Get API Keys and Update Your Local `.env` File

You will need credentials from both Appwrite and OpenWeatherMap.

### A. Get Appwrite Credentials

1.  **Find your credentials**:
    *   `VITE_APPWRITE_ENDPOINT`: This is `https://cloud.appwrite.io/v1`
    *   `VITE_APPWRITE_PROJECT_ID`: Go to **Project Settings** > **General**. Copy the **Project ID**.
    *   `VITE_APPWRITE_DB_ID`: Go to **Databases** > `bud_db` > **Settings**. Copy the **Database ID**.
    *   `VITE_APPWRITE_COLLECTION_ID`: Go to **Databases** > `bud_db` > `products` > **Settings**. Copy the **Collection ID**.
    *   `VITE_APPWRITE_CHAT_COLLECTION_ID`: Go to **Databases** > `bud_db` > `chat_history` > **Settings**. Copy the **Collection ID**.

### B. Get OpenWeatherMap API Key

1.  Go to [openweathermap.org](https://openweathermap.org/api) and sign up for a free account.
2.  Once you are logged in, navigate to the **"API keys"** tab in your user dashboard.
3.  Your default key will be generated for you automatically. Copy this key. It may take a couple of hours for the key to become active.

### C. Update Your `.env` File

Create or open your `.env` file in the root of the project (`bud/.env`) and add or update the following lines with the values you just copied:

    ```env
    # Appwrite Configuration
    VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
    VITE_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
    VITE_APPWRITE_DB_ID="YOUR_DATABASE_ID_HERE"
    VITE_APPWRITE_COLLECTION_ID="YOUR_PRODUCTS_COLLECTION_ID_HERE"
    VITE_APPWRITE_CHAT_COLLECTION_ID="YOUR_CHAT_HISTORY_COLLECTION_ID_HERE"

    # AI Service & Weather API Keys
    GROQ_API_KEY="YOUR_GROQ_API_KEY"
    OPENWEATHER_API_KEY="YOUR_OPENWEATHER_API_KEY_HERE"
    
    # Backend URL
    VITE_BACKEND_URL="http://127.0.0.1:8000"
    ```

## Step 4: Restart Your Application

After updating the `.env` file, make sure to completely stop and restart both your frontend (Vite) and backend (Uvicorn) servers for the new environment variables to take effect.

That's it! Your application should now be connected to your new Appwrite project. 