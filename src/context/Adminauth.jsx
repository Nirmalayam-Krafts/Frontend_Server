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

    // Auto-logout on 401 (expired or invalid token) and clean technical messages
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/dashboard/login", { replace: true });
        }
        
        if (error?.response?.data?.message) {
          let msg = String(error.response.data.message);
          if (msg.includes("ValidationError") || msg.includes("validation failed") || msg.includes("ValidatorError")) {
            if (msg.includes("quantity") && (msg.includes("minimum") || msg.includes("less than"))) {
              msg = "Validation Error: Quantity must be a valid number of at least 1.";
            } else {
              msg = msg
                .replace(/ValidationError\s*:/gi, "Validation Error:")
                .replace(/Inventory validation failed\s*:/gi, "")
                .trim();
            }
            error.response.data.message = msg;
          }
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
