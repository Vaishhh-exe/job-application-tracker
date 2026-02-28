"use client"

import { signOut } from "next-auth/react"
import Image from "next/image"

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="mt-auto pt-4 border-t">
      <div className="flex items-center gap-3 px-3 py-2">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.name?.[0] || user.email?.[0] || "U"}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        className="w-full mt-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
