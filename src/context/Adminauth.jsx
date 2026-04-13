import axios from "axios";
import { useState, createContext, useContext, useMemo } from "react";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [notificationOn, setNotificationOn] = useState(() => {
    const saved = localStorage.getItem("inventoryNotificationOn");
    return saved ? JSON.parse(saved) : true;
  });

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

    return instance;
  }, []);

  const handleSetNotification = (value) => {
    setNotificationOn(value);
    localStorage.setItem("inventoryNotificationOn", JSON.stringify(value));
  };

  return (
    <AuthContext.Provider
      value={{
        axiosInstance,
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
