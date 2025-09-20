"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AuthButtonProps {
  isCollapsed?: boolean
}

export function AuthButton({ isCollapsed = false }: AuthButtonProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    const loadingButton = (
      <Button 
        variant="outline" 
        disabled 
        className={isCollapsed ? "w-10 h-10 p-0" : ""}
      >
        <User className={`w-4 h-4 ${isCollapsed ? "" : "mr-2"}`} />
        {!isCollapsed && "Loading..."}
      </Button>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {loadingButton}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Loading...</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return loadingButton
  }      

  if (session) {     
    const userButton = (
      <div className={`flex items-center gap-2 ${isCollapsed ? "flex-col" : ""}`}>
        {!isCollapsed && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {session.user?.email}
          </span>
        )}
        <Button 
          variant="outline"    
          size={isCollapsed ? "icon" : "sm"}
          onClick={() => signOut({ callbackUrl: "/" })}
          className={isCollapsed ? "w-10 h-10" : ""}
        >
          <LogOut className={`w-4 h-4 ${isCollapsed ? "" : "mr-2"}`} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {userButton}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{session.user?.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return userButton
  }

  const signInButton = (
    <Button asChild className={isCollapsed ? "w-10 h-10 p-0" : ""}>
      <a href="/auth/signin">
        <User className={`w-4 h-4 ${isCollapsed ? "" : "mr-2"}`} />
        {!isCollapsed && "Sign In"}
      </a>
    </Button>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {signInButton}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Sign In</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return signInButton
}
