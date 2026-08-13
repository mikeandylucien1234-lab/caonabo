"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";

// Lecture d'une table (ou d'une requête sélective) via TanStack Query.
export function useRows<T = Record<string, unknown>>(
  key: string,
  select: string,
  opts?: { order?: { column: string; ascending?: boolean }; limit?: number },
) {
  return useQuery<T[]>({
    queryKey: [key, select, opts],
    queryFn: async () => {
      let q = getSupabase().from(key).select(select);
      if (opts?.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? true });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as T[];
    },
  });
}

// Comptage exact (sans remonter les lignes).
export function useCount(table: string) {
  return useQuery<number>({
    queryKey: [table, "count"],
    queryFn: async () => {
      const { count, error } = await getSupabase().from(table).select("*", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });
}

// Mutations génériques (insert / update / delete) avec invalidation.
export function useUpsert(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const sb = getSupabase();
      if (row.id) {
        const { id, ...rest } = row;
        const { error } = await sb.from(table).update(rest).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await sb.from(table).insert(row);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function useRemove(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function fmtUsd(cents: number | null | undefined): string {
  return `$${Math.round((cents ?? 0) / 100).toLocaleString("en-US")}`;
}
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
