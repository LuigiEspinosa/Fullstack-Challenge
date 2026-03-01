"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api";

export function NavBar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  return (
    <nav className="border-b bg-white px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold">
            Portal
          </Link>
          <Link
            href="/users"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Users
          </Link>
          <Link
            href="/posts"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Posts
          </Link>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </nav>
  )
}
