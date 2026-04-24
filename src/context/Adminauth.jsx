import axios from "axios";
import { useState, createContext, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [notificationOn, setNotificationOn] = useState(() => {
    const saved = localStorage.getItem("inventoryNotificationOn");
    return saved ? JSON.parse(saved) : true;
  });

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    navigate("/dashboard/login", { replace: true });
  }, [navigate]);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      withCredentials: true,
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Auto-logout on 401 (expired or invalid token)
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/dashboard/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [navigate]);

  const handleSetNotification = (value) => {
    setNotificationOn(value);
    localStorage.setItem("inventoryNotificationOn", JSON.stringify(value));
  };

  return (
    <AuthContext.Provider
      value={{
        axiosInstance,
        logout,
        notificationOn,
        setNotificationOn: handleSetNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  return useContext(AuthContext);
};
