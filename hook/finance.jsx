import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetFinance = (filters = {}) => {
    const { axiosInstance } = useAuthContext();

    const query = useQuery({
        queryKey: ["getFinanceData", filters.from, filters.to],
        queryFn: async () => {
            const params = {};
            if (filters.from) params.from = filters.from;
            if (filters.to)   params.to = filters.to;
            const res = await axiosInstance.get("/finance/stats", { params });
            return res.data?.data ?? res.data;
        },
    });

    return query;
};
