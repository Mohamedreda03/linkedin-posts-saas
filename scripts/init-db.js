const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "linkedin-saas";
const COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS || "posts";

async function setupDatabase() {
  try {
    // 1. Create Database
    try {
      await databases.get(DATABASE_ID);
      console.log("Database already exists.");
    } catch (error) {
      console.log("Creating database...");
      await databases.create(DATABASE_ID, "LinkedIn SaaS DB");
      console.log("Database created.");
    }

    // 2. Create Collection
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log("Collection already exists.");
    } catch (error) {
      console.log("Creating collection...");
      await databases.createCollection(DATABASE_ID, COLLECTION_ID, "Posts", [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log("Collection created.");
    }

    // 3. Create Attributes
    const attributes = [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "content", type: "string", size: 5000, required: true },
      { key: "topic", type: "string", size: 255, required: true },
      { key: "tone", type: "string", size: 50, required: false },
      { key: "isPublished", type: "boolean", required: false, default: false },
    ];

    console.log("Checking attributes...");
    // We need to wait a bit for collection to be ready sometimes, but let's try adding attributes
    // Note: In a real script we might need to check if attribute exists first to avoid errors
    // For simplicity, we'll try to create and catch "already exists" errors.

    for (const attr of attributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default
          );
        }
        console.log(`Attribute ${attr.key} created.`);
        // Wait a bit between attributes to avoid race conditions in Appwrite cloud
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        if (error.code === 409) {
          console.log(`Attribute ${attr.key} already exists.`);
        } else {
          console.error(`Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // 4. Create Indexes
    console.log("Checking indexes...");
    const indexes = [
      { key: "userId_index", type: "key", attributes: ["userId"] },
      { key: "createdAt_index", type: "key", attributes: ["$createdAt"] }, // $createdAt is system attribute
      // Fulltext search index for content
      {
        key: "search_index",
        type: "fulltext",
        attributes: ["content", "topic"],
      },
    ];

    // Wait for attributes to be available before creating indexes
    console.log("Waiting for attributes to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    for (const idx of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          idx.key,
          idx.type,
          idx.attributes
        );
        console.log(`Index ${idx.key} created.`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`Index ${idx.key} already exists.`);
        } else {
          console.error(`Error creating index ${idx.key}:`, error.message);
        }
      }
    }

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setupDatabase();
