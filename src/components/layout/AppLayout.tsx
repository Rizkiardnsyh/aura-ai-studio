import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-background/70 backdrop-blur px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">AI Creative Assistant</div>
          </header>
          <main className="flex-1 bg-hero">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
