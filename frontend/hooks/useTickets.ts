"use client";

import { useSocket } from "@/components/providers/SocketProvider";

export function useTickets() {
    const { tickets, ticketsLoading, refreshTickets } = useSocket();

    return {
        tickets,
        isLoading: ticketsLoading,
        refresh: refreshTickets,
    };
}
