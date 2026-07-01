import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetInventory = (params = {}) => {
    const { axiosInstance } = useAuthContext();

    const query = useQuery({
        queryKey: ["getInventoryData", params],
        queryFn: async () => {
            const res = await axiosInstance.get("/inventory/all", { params });

            return res.data.data;
        },
    });

    return query;
};

export const useGetLowStockAlerts = () => {
    const { axiosInstance } = useAuthContext();
    return useQuery({
        queryKey: ["getLowStockAlertsData"],
        queryFn: async () => {
            const res = await axiosInstance.get("/inventory/alerts/low-stock");
            return res.data.data;
        },

    });
};