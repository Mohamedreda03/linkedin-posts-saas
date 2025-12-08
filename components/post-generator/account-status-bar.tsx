"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Linkedin, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AccountStatusBarProps } from "./types";

export function AccountStatusBar({
  linkedInAccount,
  isLoadingAccount,
  workspaceId,
  workspaceName,
}: AccountStatusBarProps) {
  return (
    <div className="h-12 border-b border-primary/10 flex items-center justify-between px-6 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Publishing to:</span>
        {isLoadingAccount ? (
          <Spinner className="h-4 w-4" />
        ) : linkedInAccount ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0077B5] flex items-center justify-center">
              <Linkedin className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">{linkedInAccount.accountName}</span>
            <Badge variant="secondary" className="text-xs">Connected</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No LinkedIn account connected</span>
            <Link href={`/ws/${workspaceId}/settings`}>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                Connect now
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Workspace: <span className="font-medium">{workspaceName}</span>
      </div>
    </div>
  );
}
