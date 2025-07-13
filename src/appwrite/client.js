import { Client, Databases, Storage } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // from .env
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // from .env

export const databases = new Databases(client);
export const storage = new Storage(client);