import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, storage } from './firebase'; // Import storage from firebase
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary functions from Firebase storage

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe(); 
    }, []);

    const logout = async () => {
        await signOut(auth);
        console.log("User logged out");
        setUser(null);
    };

    const updateUserProfile = async (profileData) => {
        try {
            let photoURL = profileData.photoURL;

            // Check if photoURL is a File object (indicating an image upload)
            if (typeof photoURL === 'object') {
                const storageRef = ref(storage, `profile_images/${user.uid}/${photoURL.name}`);
                await uploadBytes(storageRef, photoURL); // Upload the file
                photoURL = await getDownloadURL(storageRef); // Get the download URL
            }

            // Update user profile
            await updateProfile(auth.currentUser, {
                displayName: profileData.displayName,
                photoURL: photoURL
            });

            console.log("User profile updated successfully");
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, logout, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
