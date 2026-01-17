import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { z } from "zod";

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const json = await res.json();
      return api.bookings.list.responses[200].parse(json).data || [];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.bookings.create.input>) => {
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      const json = await res.json();
      return api.bookings.create.responses[201].parse(json).data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
        queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }); // Availability might change
    },
  });
}

export function useUpdateBookingStatus() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, status }: { id: number, status: "active" | "cancelled" | "returned" }) => {
        const url = buildUrl(api.bookings.update.path, { bookingId: id });
        const res = await fetch(url, {
            method: api.bookings.update.method,
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        if(!res.ok) throw new Error("Failed to update booking");
        return await res.json();
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] }),
    });
}
