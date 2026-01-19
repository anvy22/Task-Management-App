"use client";

import { useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "sonner";
import Column from "./Column";
import api from "@/lib/api";
import { Ticket, TicketStatus } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";

const columns: TicketStatus[] = ["todo", "in_progress", "done"];

// Define allowed transitions for regular users
const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  todo: ["in_progress"],
  in_progress: ["done"],
  done: [], // Users cannot move items out of done
};

export default function Board({
  tickets,
  setTickets,
  onPendingStateChange,
}: {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  onPendingStateChange?: (isPending: boolean) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    })
  );
  const { user } = useAuth();
  // Track timeouts per ticket to allow independent cancellations
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const pendingCountRef = useRef(0);

  const updatePendingState = (delta: number) => {
    pendingCountRef.current += delta;
    onPendingStateChange?.(pendingCountRef.current > 0);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as TicketStatus;

    // Find the ticket
    const ticket = tickets.find((t) => t._id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    const oldStatus = ticket.status;
    const isAdmin = user?.role === "admin";

    // Check if the transition is allowed for regular users
    if (!isAdmin) {
      const allowed = allowedTransitions[oldStatus];
      if (!allowed.includes(newStatus)) {
        toast.error("Invalid move", {
          description: `You can only move tickets forward: Todo → In Progress → Done`,
        });
        return;
      }
    }

    // Optimistically update the UI
    setTickets((prev) =>
      prev.map((t) =>
        t._id === ticketId ? { ...t, status: newStatus } : t
      )
    );

    // Clear any existing timeout for THIS ticket (debounce)
    if (timeoutsRef.current[ticketId]) {
      clearTimeout(timeoutsRef.current[ticketId]);
      delete timeoutsRef.current[ticketId];
    }

    // Determine delay: 20s for users (to delay activity log), 500ms for admins
    const delay = isAdmin ? 500 : 5000;

    // Track if save actually happened
    let isSaved = false;

    // Set timeout to commit change
    updatePendingState(1);
    const timeoutId = setTimeout(async () => {
      isSaved = true;
      try {
        await api.patch(`/tickets/${ticketId}/status`, {
          status: newStatus,
        });
      } catch (err) {
        console.error("Failed to update status", err);
        toast.error("Failed to update status");
        // Revert on error
        setTickets((prev) =>
          prev.map((t) =>
            t._id === ticketId ? { ...t, status: oldStatus } : t
          )
        );
      } finally {
        // Cleanup timeout ref
        if (timeoutsRef.current[ticketId] === timeoutId) {
          delete timeoutsRef.current[ticketId];
          updatePendingState(-1);
        }
      }
    }, delay);

    // Store timeout
    timeoutsRef.current[ticketId] = timeoutId;

    // Show undo toast
    toast.success(
      `Moved to ${newStatus === "done" ? "Done" : newStatus === "in_progress" ? "In Progress" : "Todo"}`,
      {
        description: newStatus === "done" && !isAdmin
          ? "Pending admin review"
          : `"${ticket.title}" status updated`,
        action: {
          label: "Undo",
          onClick: async () => {
            // Revert UI immediately
            setTickets((prev) =>
              prev.map((t) =>
                t._id === ticketId ? { ...t, status: oldStatus } : t
              )
            );

            if (isSaved) {
              // If already saved to server (admin or timeout passed), revert on server
              try {
                await api.patch(`/tickets/${ticketId}/status`, {
                  status: oldStatus,
                });
                toast.info("Change reverted");
              } catch (err) {
                console.error("Failed to revert status", err);
                toast.error("Failed to revert");
              }
            } else {
              // If pending (user within 20s), just cancel the timeout
              if (timeoutsRef.current[ticketId]) {
                clearTimeout(timeoutsRef.current[ticketId]);
                delete timeoutsRef.current[ticketId];
                updatePendingState(-1);
              }
              toast.info("Change cancelled");
            }
          },
        },
        duration: 20000,
      }
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <Column key={col} status={col} tickets={tickets} />
        ))}
      </div>
    </DndContext>
  );
}
