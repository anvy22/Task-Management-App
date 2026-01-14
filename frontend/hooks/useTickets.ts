"use client";

import useSWR from "swr";
import { Ticket } from "@/types/ticket";

import { SWRConfiguration } from "swr";

export function useTickets(config?: SWRConfiguration) {
    const { data, error, isLoading, mutate } = useSWR<Ticket[]>("/tickets", {
        ...config
    });

    return {
        tickets: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}
