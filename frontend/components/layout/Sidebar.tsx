"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Kanban,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "user"],
  },
  {
    label: "My Tasks",
    href: "/dashboard/tasks",
    icon: Kanban,
    roles: ["admin", "user"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!ready) {
    return <aside className="h-screen w-64 border-r bg-background" />;
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <span className="font-semibold text-sm">Task Manager</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* Main Navigation */}
      {user && (
        <nav className="flex flex-col gap-1 p-2">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Icon size={18} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
        </nav>
      )}

     
      <div className="mt-auto border-t p-2">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-muted font-medium"
              : "hover:bg-muted/50"
          )}
        >
          <Settings size={18} />
          {!collapsed && "Settings"}
        </Link>
      </div>
    </aside>
  );
}
