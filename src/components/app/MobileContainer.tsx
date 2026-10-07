import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  isDashboard?: boolean;
}

export function MobileContainer({ children, className, isDashboard = false }: MobileContainerProps) {
  if (isDashboard) {
    return <div className={cn("w-full h-full", className)}>{children}</div>;
  }

  return (
    <div className="h-full w-full flex justify-center relative overflow-hidden bg-background">
      {/* Ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />

      <div
        className={cn(
          "w-full h-full sm:max-w-[420px] sm:max-h-[calc(100dvh-3rem)] relative overflow-hidden max-w-[100vw]",
          "bg-card/30",
          "sm:border sm:border-white/5",
          "sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-black/50",
          "sm:my-6 backdrop-blur-3xl backdrop-saturate-150",
          "flex flex-col mx-auto",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
