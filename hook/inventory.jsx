import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetInventory = () => {
    const { axiosInstance } = useAuthContext();


    const query = useQuery({
        queryKey: ["getInventoryData"],
        queryFn: async () => {
            const res = await axiosInstance.get("/inventory/all");

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