import { databases, APPWRITE_CONFIG } from "./appwrite";
import { Query } from "appwrite";

export interface Post {
  $id: string;
  $createdAt: string;
  content: string;
  topic: string;
  tone?: string;
  isPublished: boolean;
  userId: string;
}

export async function getPosts(
  userId: string,
  searchTerm?: string,
  status?: string
) {
  const queries = [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ];

  if (searchTerm) {
    queries.push(Query.search("content", searchTerm));
  }

  if (status === "published") {
    queries.push(Query.equal("isPublished", true));
  } else if (status === "draft") {
    queries.push(Query.equal("isPublished", false));
  }

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.postsCollectionId,
    queries
  );

  return response.documents as unknown as Post[];
}

export async function deletePost(postId: string) {
  await databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.postsCollectionId,
    postId
  );
}
