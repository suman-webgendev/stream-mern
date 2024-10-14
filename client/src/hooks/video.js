import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useVideoList = () => {
  return useQuery({
    queryKey: ["VideoList"],
    queryFn: async () => {
      const { data } = await api.get("/api/video");
      return data;
    },
    refetchInterval: 5 * 60 * 100,
  });
};
