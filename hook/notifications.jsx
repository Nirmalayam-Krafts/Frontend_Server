import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetNotifications = () => {
  const { axiosInstance } = useAuthContext();

  return useQuery({
    queryKey: ["getNotifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications");
      return res.data.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    staleTime: 15000,
  });
};
