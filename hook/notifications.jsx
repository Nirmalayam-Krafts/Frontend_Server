import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetNotifications = (category = "all", limit = 200) => {
  const { axiosInstance } = useAuthContext();

  return useQuery({
    queryKey: ["getNotifications", category, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(`/notifications?category=${category}&limit=${limit}`);
      return res.data.data;
    },
    refetchInterval: 15000, // Poll every 15 seconds for real-time updates
    staleTime: 10000,
  });
};

export const useMarkNotificationRead = () => {
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch("/notifications/read-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
    },
  });
};
