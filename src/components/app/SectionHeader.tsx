import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({ title, actionText, actionHref, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3 px-1", className)}>
      <h2 className="text-[17px] font-extrabold text-foreground tracking-tight">{title}</h2>
      {actionText && actionHref && (
        <Link 
          href={actionHref} 
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
