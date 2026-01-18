"use client";

import { useState } from "react";
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
import { useSocket } from "@/components/providers/SocketProvider";

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const { tickets, isLoading, refresh } = useTickets();
  const { isConnected } = useSocket();

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

  if (!ready || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        {isConnected ? 'Realtime connected' : 'Connecting...'}
      </div>

      {user.role === "admin" && (
        <CreateTicketModal
          onCreated={(t: Ticket) => {
            // The socket will handle adding the ticket, but we can refresh just in case
            refresh();
          }}
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
        setTickets={() => { }} // Socket handles updates
        onPendingStateChange={() => { }} // No longer needed
      />
    </div>
  );
}
