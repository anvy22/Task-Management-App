"use client";

import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import NotificationDropdown from "@/components/notification/NotificationDropdown";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b p-4">
      <span className="font-semibold">Dashboard</span>
      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <ModeToggle />
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
