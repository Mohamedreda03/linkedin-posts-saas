"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Post } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  PenSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "topic",
    header: "Topic",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-semibold truncate text-foreground">
            {row.getValue("topic")}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {row.original.content.substring(0, 50)}...
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tone",
    header: "Tone",
    cell: ({ row }) => {
      const tone = row.getValue("tone") as string;
      return (
        <Badge
          variant="outline"
          className="capitalize bg-secondary/50 font-normal"
        >
          {tone || "Professional"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") as boolean;
      return (
        <Badge
          className={`${
            isPublished
              ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
          } shadow-none font-medium`}
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "$createdAt",
    header: "Created",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.getValue("$createdAt")), {
            addSuffix: true,
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(post.content);
                toast.success("Content copied to clipboard");
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Content
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PenSquare className="mr-2 h-4 w-4" />
              Edit Post
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
