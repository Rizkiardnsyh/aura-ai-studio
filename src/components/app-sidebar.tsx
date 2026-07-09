import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, ImageIcon, Mic, History, User, Sparkles, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Image Studio", url: "/image-studio", icon: ImageIcon },
  { title: "Voice Assistant", url: "/voice-assistant", icon: Mic },
  { title: "History", url: "/history", icon: History },
  { title: "Profile", url: "/profile", icon: User },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ email?: string; name?: string; avatar?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUser({
        email: u.email ?? "",
        name: (u.user_metadata as { full_name?: string; name?: string })?.full_name ?? (u.user_metadata as { name?: string })?.name ?? u.email?.split("@")[0],
        avatar: (u.user_metadata as { avatar_url?: string })?.avatar_url,
      });
    });
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sidebar-foreground truncate">AI Creative</div>
              <div className="text-[11px] text-sidebar-foreground/60 truncate">Assistant</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link
                        to={item.url}
                        className={
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user && (
          <div className={collapsed ? "flex justify-center" : "space-y-2"}>
            <div className={collapsed ? "" : "flex items-center gap-3 rounded-lg bg-sidebar-accent/40 p-2"}>
              <Avatar className="h-9 w-9 border border-sidebar-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-brand text-white text-xs">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</div>
                  <div className="text-[11px] text-sidebar-foreground/60 truncate">{user.email}</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
