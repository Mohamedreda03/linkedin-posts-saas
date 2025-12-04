"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PenLine, LogOut, Linkedin, Send } from "lucide-react";
import { HeaderProps } from "./types";

export function Header({
  session,
  status,
  isPosting,
  hasContent,
  onPublish,
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-primary/10 bg-white/90 backdrop-blur-xl flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-10 h-10 bg-linear-to-br from-[#2e2e2e] to-[#3b3b3b] rounded-xl flex items-center justify-center shadow-lg shadow-[#2e2e2e]/30">
          <PenLine className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight bg-linear-to-r from-[#2e2e2e] to-[#3b3b3b] bg-clip-text text-transparent">
            PostCraft
          </span>
          <Badge className="bg-linear-to-r from-[#C76A00] to-[#E67E00] text-white text-[10px] font-bold border-0 shadow-sm">
            PRO
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <div className="w-9 h-9 rounded-full bg-primary/10 animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-3 pl-4 border-l border-primary/10">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground">
                {session.user?.name}
              </p>
              <p className="text-xs text-[#C76A00] font-medium">Pro Member</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-[#2e2e2e]/20 shadow-md ring-2 ring-[#2e2e2e]/10 ring-offset-2 cursor-pointer hover:ring-[#2e2e2e]/30 transition-all">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback className="bg-linear-to-br from-[#2e2e2e] to-[#3b3b3b] text-white font-bold">
                {session.user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => signIn("linkedin")}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white shadow-lg shadow-[#2a2a2a]/30 rounded-full px-6 font-medium transition-all hover:scale-105"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            Connect LinkedIn
          </Button>
        )}

        {/* Publish Button */}
        <Button
          onClick={onPublish}
          disabled={isPosting || !hasContent}
          className="bg-linear-to-r from-[#C76A00] to-[#E67E00] hover:from-[#B85F00] hover:to-[#D47000] text-white shadow-lg shadow-[#C76A00]/30 rounded-full px-6 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPosting ? (
            <>
              <Spinner size="sm" className="text-white mr-2" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
