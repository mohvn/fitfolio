import Link from "next/link";
import { DumbbellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 py-6">
      <span className="flex size-10 items-center justify-center rounded-mark border border-border bg-accent text-muted-foreground squircle">
        <DumbbellIcon className="size-4" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm">{title}</p>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button render={<Link href={actionHref} />} size="sm" className="squircle">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
