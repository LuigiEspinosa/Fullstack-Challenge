import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export function SavedBadge() {
  return (
    <Badge
      variant="outline"
      className="border-emerald-200 bg-emerald-50 text-emerald-700"
    >
      <CheckCircle />
      Saved locally
    </Badge>
  )
}
