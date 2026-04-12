import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../src/context/Adminauth";

export const useGetFinance = () => {
    const { axiosInstance } = useAuthContext();


    const query = useQuery({
        queryKey: ["getFinanceData"],
        queryFn: async () => {
            const res = await axiosInstance.get("/finance/stats");
            console.log("res data",res);
            return res.data;
        },
    });

    return query;
};
