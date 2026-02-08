"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/session", fetcher);

  return {
    user: data?.authenticated ? { username: data.username, userId: data.userId } : null,
    isLoading,
    isError: error,
    mutate,
  };
}
