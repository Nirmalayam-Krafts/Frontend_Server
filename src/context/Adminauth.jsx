import axios from "axios";
import { useState, createContext, useContext, useMemo } from "react";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [notificationOn, setNotificationOn] = useState(() => {
    const saved = localStorage.getItem("inventoryNotificationOn");
    return saved ? JSON.parse(saved) : true;
  });

  const adminToken = localStorage.getItem("adminToken");

  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  }, [adminToken]);

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