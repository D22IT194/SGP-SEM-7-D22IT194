import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './Firebase'; // Fixed the import (was etstorage)
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Create AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe(); 
    }, []);

    // Logout function
    const logout = async () => {
        await signOut(auth);
        console.log("User logged out");
        setUser(null); // Clear user state after logout
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
