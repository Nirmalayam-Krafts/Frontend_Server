import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthView from "../../Auth/Auth";
import { useAuthContext } from "../../context/Adminauth";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Signup() {
  const { axiosInstance } = useAuthContext();
  const navigate = useNavigate();

  const queryClient = useQueryClient()
  const handleSignup = async (data) => {
    const loadingToast = toast.loading("Creating account...");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    try {
      const payload = {
        name: data.name?.trim(),
        email: data.email?.trim(),
        phone: data.phone?.trim(),
        password: data.password,
      };

      const response = await axiosInstance.post("/admin/signup", payload);

      const token = response?.data?.data?.token;

      if (token) {
        localStorage.setItem("adminToken", token);
      }

      toast.success("Signup successful 🎉", {
        id: loadingToast,
      });
      queryClient.invalidateQueries({
        queryKey: ['getCurrentUser']
      })
      navigate("/dashboard");
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || "Signup failed. Please try again.";

      if (status === 409) {
        toast.error("Email already exists", {
          id: loadingToast,
        });
        return;
      }

      if (status === 400) {
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
      mode="signup"
      onSignup={handleSignup}
      footerText={
        <p className="text-sm text-on-surface-variant text-center mt-1">
          Already have an account?{" "}
          <Link
            to="/dashboard/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    />
  );
}