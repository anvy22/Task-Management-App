"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Board from "@/components/kanban/Board";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";
import CreateTicketModal from "@/components/ticket/CreateTicketModal";
import { useTickets } from "@/hooks/useTickets";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function DashboardPage() {
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const { user, ready } = useAuth();

  const { tickets, isLoading, mutate } = useTickets({
    refreshInterval: isPollingPaused ? 0 : 3000
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredTickets = tickets
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority-high") {
        const priorityMap = { low: 1, medium: 2, high: 3 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      }
      if (sortBy === "priority-low") {
        const priorityMap = { low: 1, medium: 2, high: 3 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      }
      // Default newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleSetTickets: React.Dispatch<React.SetStateAction<Ticket[]>> = (action) => {
    mutate((prev) => {
      const newData = typeof action === 'function' ? action(prev || []) : action;
      return newData;
    }, false);
  };

  // No need for early return - parent layout handles auth
  // Just show loading state while data is being fetched
  if (!ready || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show loading during initial fetch if no data
  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user.role === "admin" && (
        <CreateTicketModal
          onCreated={(t: Ticket) =>
            // Optimistically update or revalidate
            mutate((prev) => [...(prev || []), t])
          }
        />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="priority-high">Priority: High to Low</SelectItem>
            <SelectItem value="priority-low">Priority: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Board
        tickets={filteredTickets}
        setTickets={handleSetTickets}
        onPendingStateChange={setIsPollingPaused}
      />
    </div>
  );
}
