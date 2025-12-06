"use client";

import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

export function UserNav() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="pl-2 pr-4 h-10 rounded-md border-zinc-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7 border border-zinc-200 group-hover:border-indigo-200 transition-colors rounded-sm">
              <AvatarImage src={""} alt={user?.name} />
              <AvatarFallback className="bg-zinc-100 text-zinc-700 text-xs font-bold rounded-sm group-hover:bg-indigo-100 group-hover:text-indigo-700">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left hidden sm:flex">
              <span className="text-sm font-semibold leading-none text-zinc-700 group-hover:text-indigo-700 transition-colors">
                {user?.name}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-indigo-600 transition-colors ml-1" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
