import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardStats, Product, Sale, SaleItem } from "../backend.d";
import { useActor } from "./useActor";

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSales() {
  const { actor, isFetching } = useActor();
  return useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      name: string;
      category: string;
      price: number;
      stock: bigint;
      unit: string;
      lowStockThreshold: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addProduct(
        p.name,
        p.category,
        p.price,
        p.stock,
        p.unit,
        p.lowStockThreshold,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: bigint;
      name: string;
      category: string;
      price: number;
      stock: bigint;
      unit: string;
      lowStockThreshold: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock,
        p.unit,
        p.lowStockThreshold,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useCreateSale() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { items: SaleItem[]; totalAmount: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.createSale(p.items, p.totalAmount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
