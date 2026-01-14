"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ticket {
  _id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  deadline?: string;
  createdAt: string;
}

export default function UserTickets() {
  const { userId } = useParams<{ userId: string }>();


  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchTickets();
  }, [userId]);

  async function fetchTickets() {
    try {
      const res = await api.get(`/users/userdetails`, {
        params: { userId },
      });
      setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-auto">
      {tickets.map((ticket) => (
        <Link key={ticket._id} href={`/dashboard/ticket/${ticket._id}`}>
          <Card className="cursor-pointer transition hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-semibold">{ticket.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">
                  {ticket.status.replace("_", " ")}
                </Badge>
                <Badge
                  variant={
                    ticket.priority === "high"
                      ? "destructive"
                      : ticket.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {ticket.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {tickets.length === 0 && (
        <p className="text-center text-muted-foreground pt-100">
          No tickets assigned
        </p>
      )}
    </div>
  );
}
