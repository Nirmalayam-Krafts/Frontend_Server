import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

// ── Get All Orders ─────────────────────────────────────────────
export const useGetAllOrders = (params = {}) => {
  const { axiosInstance } = useAuthContext();

  const query = useQuery({
    queryKey: ["getAllOrders", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/orders", { params });

      return res.data.data;
    },
  });

  return query;
};

// ── Get Global Order Stats (aggregated across ALL orders) ──────
export const useGetOrderStats = () => {
  const { axiosInstance } = useAuthContext();

  const query = useQuery({
    queryKey: ["getOrderStats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/orders/stats");
      return res.data.data;
    },
    // Refresh every 30 seconds for near-real-time dashboard
    refetchInterval: 30000,
  });

  return query;
};