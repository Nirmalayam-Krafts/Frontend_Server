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