import React, { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Helpers from "@/config/helpers";
import useUserStore from "@/store/useUserStore";

interface AuthProps {
  children: ReactNode;
  isAuth?: boolean;
  isAdmin?: boolean;
}

const Auth: React.FC<AuthProps> = ({
  children,
  isAuth = true,
  isAdmin = false,
}) => {
  const { user, token, setUser, clearUser } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  // Fetch the latest user data from backend
  const fetchUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      clearUser();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Helpers.showToast("Session expired. Please login again.", "error");
      clearUser();
      navigate("/login", { replace: true });
      return;
    }

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Helpers.showToast("Session expired. Please login again.", "error");
        clearUser();
        navigate("/login", { replace: true });
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token, user, navigate, clearUser, setUser]);


  useEffect(() => {
    if (!loading && user && token) {
      if (user.role === "user" && (user as any).isOld) {
        navigate("/setup-card", { replace: true });
      }
    }
  }, [loading, token, user?.isOld, user?.role, navigate]);

  if (loading) return null;

  const getRedirectPath = (): string | null => {
    if (token && isTokenExpired(token)) {
      clearUser();
      Helpers.showToast("Session expired. Please login again.", "error");
      navigate("/login");
      return null;
    }

    if (!isAuth) {
      if (user && token) {
        return user.role === "admin" ? "/admin/users" : "/chat/new";
      }
      return null;
    }

    if (!user || !token) {
      Helpers.showToast("Please login to continue.", "error");
      return "/login";
    }

    if (isAdmin && user.role !== "admin") {
      Helpers.showToast(
        "Access denied. Only administrators can access this area.",
        "error"
      );
      return "/chat/new";
    }

    if (!isAdmin && user.role === "admin") {
      Helpers.showToast(
        "Access denied. Please use the admin dashboard.",
        "error"
      );
      return "/admin/users";
    }

    return null;
  };

  const redirectPath = getRedirectPath();
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default Auth;
