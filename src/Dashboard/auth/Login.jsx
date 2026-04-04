import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthView from "../../Auth/Auth";
import { useAuthContext } from "../../context/Adminauth";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const { axiosInstance } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const handleLogin = async (data) => {
    const loadingToast = toast.loading("Signing in...");

    try {
      const payload = {
        email: data.email?.trim(),
        password: data.password,
      };

      const response = await axiosInstance.post("/admin/login", payload);
      console.log(response)
      const token = response?.data?.data?.token;

      if (token) {
        localStorage.setItem("adminToken", token);
      }

      toast.success("Login successful 🎉", {
        id: loadingToast,
      });
      queryClient.invalidateQueries({
        queryKey: ['getCurrentUser']
      })

      navigate("/dashboard");
    } catch (error) {
      const status = error?.response?.status;
      console.log(error)
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";

      if (status === 400 || status === 401) {
        toast.error(message, {
          id: loadingToast,
        });
        return;
      }

      toast.error(message, {
        id: loadingToast,
      });
    }
  };

  return (
    <AuthView
      mode="login"
      onLogin={handleLogin}
      footerText={
        <p className="text-sm text-on-surface-variant text-center mt-1">
          Don&apos;t have an account?{" "}
          <Link
            to="/dashboard/signup"
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    />
  );
}