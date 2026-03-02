import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the portal.</p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/users">Browse Users</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/posts">Browse Posts</Link>
        </Button>
      </div>
    </div>
  );
}
