import { Client, Account, Databases } from "appwrite";

export const client = new Client();

client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const account = new Account(client);
export const databases = new Databases(client);

export const APPWRITE_CONFIG = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "linkedin-saas",
  postsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS || "posts",
};
