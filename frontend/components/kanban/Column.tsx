"use client";

import { useDroppable } from "@dnd-kit/core";
import TicketCard from "./TicketCard";
import { Ticket } from "@/types/ticket";

const columnTitles: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export default function Column({
  status,
  tickets,
}: {
  status: string;
  tickets: Ticket[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-muted/50 rounded-lg p-3 min-h-[200px] transition-colors ${isOver ? "bg-muted" : ""
        }`}
    >
      <h3 className="font-semibold mb-4">{columnTitles[status]}</h3>

      {tickets
        .filter((t) => t.status === status)
        .map((ticket) => (
          <TicketCard key={ticket._id} ticket={ticket} />
        ))}
    </div>
  );
}

