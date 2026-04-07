import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetAllProducts = (params = {}) => {
  const { axiosInstance } = useAuthContext();

  return useQuery({
    queryKey: ["getAllProducts", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/products", { params });
      return res.data.data;
    },
  });
};

export const useGetProductById = (id) => {
  const { axiosInstance } = useAuthContext();

  return useQuery({
    queryKey: ["getProductById", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await axiosInstance.get(`/products/${id}`);
      return res.data.data;
    },
  });
};