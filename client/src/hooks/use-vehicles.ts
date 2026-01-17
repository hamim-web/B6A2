import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "./use-auth";
import { z } from "zod";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export function useVehicles() {
  return useQuery({
    queryKey: [api.vehicles.list.path],
    queryFn: async () => {
      const res = await fetch(api.vehicles.list.path, { 
        headers: getAuthHeaders() 
      });
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const json = await res.json();
      return api.vehicles.list.responses[200].parse(json).data || [];
    },
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: [api.vehicles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.vehicles.get.path, { vehicleId: id });
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch vehicle");
      const json = await res.json();
      return api.vehicles.get.responses[200].parse(json).data;
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.vehicles.create.input>) => {
      const res = await fetch(api.vehicles.create.path, {
        method: api.vehicles.create.method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create vehicle");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}

export function useUpdateVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.vehicles.update.input>) => {
        const url = buildUrl(api.vehicles.update.path, { vehicleId: id });
        const res = await fetch(url, {
          method: api.vehicles.update.method,
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update vehicle");
        return await res.json();
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
    });
  }

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vehicles.delete.path, { vehicleId: id });
      const res = await fetch(url, {
        method: api.vehicles.delete.method,
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete vehicle");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}
