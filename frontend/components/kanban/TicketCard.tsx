"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/types/ticket";
import clsx from "clsx";
import { Clock, CheckCircle } from "lucide-react";

// Border colors based on status and review state
const getStatusColor = (ticket: Ticket) => {
  if (ticket.status === "done") {
    return ticket.isReviewed ? "border-green-500" : "border-yellow-500";
  }
  if (ticket.status === "in_progress") return "border-orange-400";
  return "border-muted";
};

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const wasDraggingRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ticket._id,
    });

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

  const isPendingReview = ticket.status === "done" && !ticket.isReviewed;
  const isCompleted = ticket.status === "done" && ticket.isReviewed;

  // Track if dragging occurred
  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
    }
  }, [isDragging]);

  // Only navigate if it wasn't a drag
  const handleClick = (e: React.MouseEvent) => {
    // If we were just dragging, prevent navigation
    if (wasDraggingRef.current) {
      e.preventDefault();
      wasDraggingRef.current = false;
      return;
    }
    router.push(`/dashboard/ticket/${ticket._id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(isDragging && "opacity-50")}
    >
      <Card
        onClick={handleClick}
        className={clsx(
          "mb-3 cursor-pointer border-l-4 hover:shadow-md transition-shadow",
          getStatusColor(ticket)
        )}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium flex-1">{ticket.title}</div>
            {isPendingReview && (
              <Badge
                variant="outline"
                className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs shrink-0"
              >
                <Clock className="w-3 h-3 mr-1" />
                Review
              </Badge>
            )}
            {isCompleted && (
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-600 border-green-500/30 text-xs shrink-0"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Done
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary">{ticket.priority}</Badge>
            <span className="text-xs text-muted-foreground">
              {ticket.assignedTo.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
