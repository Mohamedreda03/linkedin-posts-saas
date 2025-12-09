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
const SOCIAL_ACCOUNTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS || "social_accounts";
const WORKSPACES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACES || "workspaces";
const WORKSPACE_ACCOUNTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS || "workspace_accounts";

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
      { key: "workspaceId", type: "string", size: 36, required: false }, // Will be required after migration
      { key: "content", type: "string", size: 5000, required: true },
      { key: "topic", type: "string", size: 255, required: true },
      { key: "tone", type: "string", size: 50, required: false },
      { key: "isPublished", type: "boolean", required: false, default: false },
      { key: "publishedTo", type: "string", size: 50, required: false }, // Platform published to
      { key: "publishedAt", type: "string", size: 50, required: false }, // ISO date
      // New fields for Phase 1
      { key: "status", type: "string", size: 20, required: false, default: "draft" }, // draft|scheduled|publishing|published|failed
      { key: "scheduledAt", type: "string", size: 50, required: false }, // ISO date for scheduling
      { key: "publishedPlatforms", type: "string", size: 2000, required: false, default: "[]" }, // JSON array
      { key: "errorLog", type: "string", size: 2000, required: false }, // Error details
      { key: "mediaUrls", type: "string", size: 2000, required: false, default: "[]" }, // JSON array of media URLs
      { key: "retryCount", type: "integer", required: false, default: 0 }, // Number of retry attempts
      { key: "lastRetryAt", type: "string", size: 50, required: false }, // Last retry timestamp
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
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max
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
      { key: "workspaceId_index", type: "key", attributes: ["workspaceId"] },
      { key: "createdAt_index", type: "key", attributes: ["$createdAt"] }, // $createdAt is system attribute
      // Fulltext search index for content
      {
        key: "search_index",
        type: "fulltext",
        attributes: ["content", "topic"],
      },
      // New indexes for Phase 1
      { key: "status_idx", type: "key", attributes: ["status"] },
      { key: "scheduledAt_idx", type: "key", attributes: ["scheduledAt"] },
      { key: "workspace_status_idx", type: "key", attributes: ["workspaceId", "status"] }, // Composite
      { key: "user_status_idx", type: "key", attributes: ["userId", "status"] }, // Composite
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

    // ========================================
    // 5. Create Social Accounts Collection
    // ========================================
    console.log("\n--- Setting up Social Accounts Collection ---");
    
    try {
      await databases.getCollection(DATABASE_ID, SOCIAL_ACCOUNTS_COLLECTION_ID);
      console.log("Social Accounts collection already exists.");
    } catch (error) {
      console.log("Creating Social Accounts collection...");
      await databases.createCollection(DATABASE_ID, SOCIAL_ACCOUNTS_COLLECTION_ID, "Social Accounts", [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log("Social Accounts collection created.");
    }

    // 6. Create Social Accounts Attributes
    // Social accounts are now user-level (not workspace-level)
    // Junction table workspace_accounts links them to workspaces
    const socialAccountsAttributes = [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "platform", type: "string", size: 50, required: true }, // linkedin, twitter, facebook, instagram
      { key: "platformUserId", type: "string", size: 255, required: true }, // Platform-specific user ID
      { key: "accessToken", type: "string", size: 2000, required: true }, // OAuth access token (encrypted)
      { key: "refreshToken", type: "string", size: 2000, required: false }, // OAuth refresh token (encrypted)
      { key: "tokenExpiry", type: "string", size: 50, required: false }, // ISO date string
      { key: "accountName", type: "string", size: 255, required: true }, // Display name
      { key: "accountEmail", type: "string", size: 255, required: false }, // Account email
      { key: "accountImage", type: "string", size: 500, required: false }, // Profile image URL
    ];

    console.log("Checking Social Accounts attributes...");
    for (const attr of socialAccountsAttributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            SOCIAL_ACCOUNTS_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            SOCIAL_ACCOUNTS_COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default
          );
        }
        console.log(`Social Accounts attribute ${attr.key} created.`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        if (error.code === 409) {
          console.log(`Social Accounts attribute ${attr.key} already exists.`);
        } else {
          console.error(`Error creating Social Accounts attribute ${attr.key}:`, error.message);
        }
      }
    }

    // 7. Create Social Accounts Indexes
    console.log("Checking Social Accounts indexes...");
    const socialAccountsIndexes = [
      { key: "userId_index", type: "key", attributes: ["userId"] },
      { key: "platform_index", type: "key", attributes: ["platform"] },
      { key: "platformUserId_platform_index", type: "unique", attributes: ["platformUserId", "platform"] }, // Same account can't be linked twice
    ];

    console.log("Waiting for Social Accounts attributes to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    for (const idx of socialAccountsIndexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          SOCIAL_ACCOUNTS_COLLECTION_ID,
          idx.key,
          idx.type,
          idx.attributes
        );
        console.log(`Social Accounts index ${idx.key} created.`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`Social Accounts index ${idx.key} already exists.`);
        } else {
          console.error(`Error creating Social Accounts index ${idx.key}:`, error.message);
        }
      }
    }

    // ========================================
    // 8. Create Workspaces Collection
    // ========================================
    console.log("\n--- Setting up Workspaces Collection ---");
    
    try {
      await databases.getCollection(DATABASE_ID, WORKSPACES_COLLECTION_ID);
      console.log("Workspaces collection already exists.");
    } catch (error) {
      console.log("Creating Workspaces collection...");
      await databases.createCollection(DATABASE_ID, WORKSPACES_COLLECTION_ID, "Workspaces", [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log("Workspaces collection created.");
    }

    // 9. Create Workspaces Attributes
    const workspacesAttributes = [
      { key: "name", type: "string", size: 100, required: true },
      { key: "slug", type: "string", size: 100, required: true },
      { key: "ownerId", type: "string", size: 36, required: true },
      { key: "icon", type: "string", size: 50, required: false },
      { key: "color", type: "string", size: 20, required: false },
    ];

    console.log("Checking Workspaces attributes...");
    for (const attr of workspacesAttributes) {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          WORKSPACES_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
        console.log(`Workspaces attribute ${attr.key} created.`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        if (error.code === 409) {
          console.log(`Workspaces attribute ${attr.key} already exists.`);
        } else {
          console.error(`Error creating Workspaces attribute ${attr.key}:`, error.message);
        }
      }
    }

    // 10. Create Workspaces Indexes
    console.log("Checking Workspaces indexes...");
    const workspacesIndexes = [
      { key: "ownerId_index", type: "key", attributes: ["ownerId"] },
      { key: "slug_index", type: "unique", attributes: ["slug"] },
    ];

    console.log("Waiting for Workspaces attributes to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    for (const idx of workspacesIndexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          WORKSPACES_COLLECTION_ID,
          idx.key,
          idx.type,
          idx.attributes
        );
        console.log(`Workspaces index ${idx.key} created.`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`Workspaces index ${idx.key} already exists.`);
        } else {
          console.error(`Error creating Workspaces index ${idx.key}:`, error.message);
        }
      }
    }

    // ========================================
    // 11. Create Workspace Accounts Collection (Junction Table)
    // ========================================
    console.log("\n--- Setting up Workspace Accounts Collection (Junction Table) ---");
    
    try {
      await databases.getCollection(DATABASE_ID, WORKSPACE_ACCOUNTS_COLLECTION_ID);
      console.log("Workspace Accounts collection already exists.");
    } catch (error) {
      console.log("Creating Workspace Accounts collection...");
      await databases.createCollection(DATABASE_ID, WORKSPACE_ACCOUNTS_COLLECTION_ID, "Workspace Accounts", [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log("Workspace Accounts collection created.");
    }

    // 12. Create Workspace Accounts Attributes
    const workspaceAccountsAttributes = [
      { key: "workspaceId", type: "string", size: 36, required: true },
      { key: "socialAccountId", type: "string", size: 36, required: true },
      { key: "userId", type: "string", size: 36, required: true }, // For quick access control
    ];

    console.log("Checking Workspace Accounts attributes...");
    for (const attr of workspaceAccountsAttributes) {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          WORKSPACE_ACCOUNTS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
        console.log(`Workspace Accounts attribute ${attr.key} created.`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        if (error.code === 409) {
          console.log(`Workspace Accounts attribute ${attr.key} already exists.`);
        } else {
          console.error(`Error creating Workspace Accounts attribute ${attr.key}:`, error.message);
        }
      }
    }

    // 13. Create Workspace Accounts Indexes
    console.log("Checking Workspace Accounts indexes...");
    const workspaceAccountsIndexes = [
      { key: "workspaceId_index", type: "key", attributes: ["workspaceId"] },
      { key: "socialAccountId_index", type: "key", attributes: ["socialAccountId"] },
      { key: "userId_index", type: "key", attributes: ["userId"] },
      { key: "workspace_account_unique", type: "unique", attributes: ["workspaceId", "socialAccountId"] },
    ];

    console.log("Waiting for Workspace Accounts attributes to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    for (const idx of workspaceAccountsIndexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          WORKSPACE_ACCOUNTS_COLLECTION_ID,
          idx.key,
          idx.type,
          idx.attributes
        );
        console.log(`Workspace Accounts index ${idx.key} created.`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`Workspace Accounts index ${idx.key} already exists.`);
        } else {
          console.error(`Error creating Workspace Accounts index ${idx.key}:`, error.message);
        }
      }
    }

    console.log("\nDatabase setup completed successfully!");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setupDatabase();
