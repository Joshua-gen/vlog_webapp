import React, {createContext, useState, useEffect, useContext} from "react";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export const AuthProvider = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch("http://localhost:5000/profile", {
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData); // Now has username, bio, image
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem("token");
                    }
                } catch {
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    //login
    const login = async (token, userData) => {
        localStorage.setItem("token", token);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, user, login, logout, loading}}>{children}</AuthContext.Provider>
    );
};
