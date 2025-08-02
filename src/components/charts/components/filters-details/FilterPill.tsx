import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  value: React.ReactNode;
  href?: string;
}

export function FilterPill({ label, value, href }: FilterPillProps) {
  const isInteractive = !!href;

  const content = (
    <>
      <span className="font-medium text-foreground/80 underline">{label}:</span>
      <span className="ml-1.5 font-semibold text-foreground">{value}</span>
      {isInteractive && <ChevronRight className="h-4 w-4 ml-1 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />}
    </>
  );

  if (isInteractive) {
    return (
      <Link
        to={href}
        className={cn(
          "group flex items-center px-3 py-1.5 text-sm rounded-full transition-colors",
          "bg-background border hover:bg-muted/50"
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center px-3 py-1.5 text-sm rounded-full",
        "bg-secondary/70 border border-transparent"
      )}
    >
      {content}
    </div>
  );
} 