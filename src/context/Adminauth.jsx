import axios from "axios"
import { createContext ,useContext} from "react"

const AuthContext = createContext()

const axiosInstance  = axios.create({
 baseURL:import.meta.env.VITE_API_BASE_URL,
 withCredentials: true,
})
export const AuthContextProvider = ({children})=>{
 return (
    <AuthContext.Provider value={{axiosInstance}}>
        {children}
    </AuthContext.Provider>
 )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = ()=>{
    return useContext(AuthContext)
}