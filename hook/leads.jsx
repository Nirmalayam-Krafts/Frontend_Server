import { useQuery } from "@tanstack/react-query"
import { useAuthContext } from "../src/context/Adminauth"

export const usegetAllLeads = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { axiosInstance } = useAuthContext()
    const adminToken = localStorage.getItem("adminToken")
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useQuery({
        queryKey: ["getAllLeadsData"],
        queryFn: async () => {
            const res = await axiosInstance.get("/leads", {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            })
            return res.data.data

        },
        enabled: !!adminToken, 
        retry: false,
    })
    return query;
}