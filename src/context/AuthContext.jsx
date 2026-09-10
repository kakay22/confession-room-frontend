import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const token = localStorage.getItem("access");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("auth/profile/");
            setUser(response.data);
        } catch (error) {
            console.error("FETCH USER ERROR:", error.response?.data);

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await api.post("auth/login/", {
            username,
            password,
        });

        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);

        // Get logged-in user
        const profileResponse = await api.get("auth/profile/");

        setUser(profileResponse.data);

        return profileResponse.data;
    };

    const register = async (username, password, password2) => {
        // Create account
        await api.post("auth/register/", {
            username,
            password,
            password2,
        });

        // Automatically login after registration
        const loginResponse = await api.post("auth/login/", {
            username,
            password,
        });

        localStorage.setItem(
            "access",
            loginResponse.data.access
        );

        localStorage.setItem(
            "refresh",
            loginResponse.data.refresh
        );

        // Get user profile
        const profileResponse = await api.get(
            "auth/profile/"
        );

        setUser(profileResponse.data);

        return profileResponse.data;
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setUser(null);

        // Redirect to home
        navigate("/");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}