import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetAllRawMaterials = (params = {}) => {
  const { axiosInstance } = useAuthContext();

  return useQuery({
    queryKey: ["getAllRawMaterials", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/raw-materials", { params });
      return res.data.data;
    },
  });
};

export const useGetLowStockRawMaterials = () => {
  const { axiosInstance } = useAuthContext();

  return useQuery({
    queryKey: ["getLowStockRawMaterials"],
    queryFn: async () => {
      const res = await axiosInstance.get("/raw-materials/alerts/low-stock");
      return res.data.data;
    },
  });
};