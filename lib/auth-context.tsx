"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { account, Workspace } from "@/lib/appwrite";
import { getWorkspaces } from "@/lib/api";
import { Models } from "appwrite";
import { useRouter, usePathname } from "next/navigation";

const WORKSPACE_STORAGE_KEY = "currentWorkspaceId";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  checkUser: () => Promise<void>;
  logout: () => Promise<void>;
  // Workspace context
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  workspacesLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  setCurrentWorkspaceById: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const refreshWorkspaces = async () => {
    if (!user) return;
    
    setWorkspacesLoading(true);
    try {
      const userWorkspaces = await getWorkspaces(user.$id);
      setWorkspaces(userWorkspaces);

      // If no current workspace, try to restore from localStorage or use first
      if (!currentWorkspace && userWorkspaces.length > 0) {
        const savedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
        const savedWorkspace = savedWorkspaceId 
          ? userWorkspaces.find(w => w.$id === savedWorkspaceId)
          : null;
        
        setCurrentWorkspace(savedWorkspace || userWorkspaces[0]);
        
        if (!savedWorkspace && userWorkspaces.length > 0) {
          localStorage.setItem(WORKSPACE_STORAGE_KEY, userWorkspaces[0].$id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch workspaces", error);
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.$id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
    }
  };

  // Set workspace by ID without navigation (for URL-based routing)
  const setCurrentWorkspaceById = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.$id === workspaceId);
    if (workspace && currentWorkspace?.$id !== workspaceId) {
      setCurrentWorkspace(workspace);
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Load workspaces when user changes
  useEffect(() => {
    if (user) {
      refreshWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const publicRoutes = [
      "/",
      "/auth/sign-in",
      "/auth/sign-up",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/onboarding",
    ];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push("/auth/sign-in");
    } else if (
      user &&
      (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")
    ) {
      // Check if user has workspaces, if not redirect to onboarding
      if (workspaces.length === 0 && !workspacesLoading) {
        router.push("/onboarding");
      } else if (currentWorkspace) {
        router.push(`/ws/${currentWorkspace.$id}`);
      }
    }
  }, [user, loading, pathname, router, workspaces, workspacesLoading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      checkUser, 
      logout,
      workspaces,
      currentWorkspace,
      workspacesLoading,
      switchWorkspace,
      setCurrentWorkspaceById,
      refreshWorkspaces,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
