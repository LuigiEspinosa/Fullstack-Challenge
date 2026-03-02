"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SavedBadge } from "@/components/saved-badge";
import { getReqResUsers, getSavedUsers } from "@/lib/api";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["reqres-users", page],
    queryFn: () => getReqResUsers(page),
  });

  const { data: savedData } = useQuery({
    queryKey: ["saved-users"],
    queryFn: getSavedUsers,
  });

  const containerRef = useGsapContext<HTMLDivElement>(() => {
    gsap.from('.user-card', {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      ease: 'power2.out'
    });
  })

  const savedIds = useMemo(
    () => new Set((savedData?.data ?? []).map((u) => u.id)),
    [savedData]
  );

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return (usersData?.data ?? []).filter(
      (u) =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [usersData, search]);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-2xl font-bold">Users</h1>
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <p className="text-sm text-muted-foreground">No users found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Link key={user.id} href={`/users/${user.id}`}>
            <div className="user-card cursor-pointer rounded-lg border bg-white p-4 transition-colors hover:bg-zinc-50">
              <div className="flex items-center gap-3">
                <Image
                  src={user.avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              {savedIds.has(user.id) && (
                <div className="mt-3">
                  <SavedBadge />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {usersData && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {usersData.page} of {usersData.total_pages} ({usersData.total} total users)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= usersData.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
