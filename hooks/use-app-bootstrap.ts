import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { repository } from "@/lib/mock/repository";
import { useAppStore } from "@/store/app-store";

export const useAppBootstrap = () => {
  const setSession = useAppStore((state) => state.setSession);
  const setBootstrapped = useAppStore((state) => state.setBootstrapped);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bootstrap"],
    queryFn: async () => {
      await repository.ensureReady();
      return repository.getSession();
    },
  });

  useEffect(() => {
    if (query.data) {
      setSession(query.data);
      setBootstrapped(true);
    }
  }, [query.data, setBootstrapped, setSession]);

  useEffect(() => {
    const unsubscribe = repository.subscribe(() => {
      queryClient.invalidateQueries();
    });
    return unsubscribe;
  }, [queryClient]);

  return query;
};
