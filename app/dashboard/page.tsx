"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getPosts } from "@/lib/api";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { UserNav } from "@/components/dashboard/user-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Plus, LayoutGrid, List, PenTool } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: posts,
    isLoading: isPostsLoading,
    isError,
  } = useQuery({
    queryKey: ["posts", user?.$id, queryTerm, statusFilter],
    queryFn: () =>
      getPosts(
        user!.$id,
        queryTerm,
        statusFilter === "all" ? undefined : statusFilter
      ),
    enabled: !!user,
  });

  const isLoading = authLoading || isPostsLoading;

  const handleSearch = () => {
    setQueryTerm(searchInput);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          {/* Top Row: Search & Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left: Search */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by topic or content..."
                  className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-0 transition-all rounded-lg font-medium"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all"
              >
                Search
              </Button>
            </div>

            {/* Right: Create & User */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <Link href="/generator">
                <Button className="h-11 px-6 bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-bold tracking-wide transition-all shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
                  <PenTool className="w-4 h-4 mr-2" />
                  CREATE POST
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>

          {/* Bottom Row: Filter Switch */}
          <div className="flex items-center">
            <Tabs
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-auto"
            >
              <TabsList className="h-10 bg-zinc-100 p-1 rounded-lg flex gap-1">
                <TabsTrigger
                  value="all"
                  className="rounded-md px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  All Posts
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="rounded-md px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  Published
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="rounded-md px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  Drafts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          {isLoading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
              <p className="text-zinc-500 font-medium">Loading your posts...</p>
            </div>
          ) : isError ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8">
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 border border-red-100">
                <LayoutGrid className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">
                Unable to load posts
              </h3>
              <p className="text-zinc-500 max-w-xs mx-auto mb-6">
                Connection issue detected. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-lg border-zinc-200"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="relative">
              {posts && posts.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 bg-zinc-50 rounded-xl flex items-center justify-center mb-6 border border-zinc-100">
                    <List className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                    Your dashboard is empty. Create your first high-impact
                    LinkedIn post now.
                  </p>
                  <Link href="/generator">
                    <Button
                      size="lg"
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start Creating
                    </Button>
                  </Link>
                </div>
              ) : (
                <DataTable columns={columns} data={posts || []} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
