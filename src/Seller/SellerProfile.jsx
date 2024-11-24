import React, { useEffect, useState } from 'react';
import { useAuth } from '../Dashboard/AuthContext';
import SellerHeader from './SellerHeader'; 
import Footer from '../Dashboard/Footer';
import { updateEmail, updateProfile } from 'firebase/auth'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { auth, storage } from './Firebase'; // Ensure Firebase storage is imported
import { getDatabase, ref as dbRef, set } from 'firebase/database'; // Import Realtime Database functions
import { toast, ToastContainer } from 'react-toastify'; // Import Toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Import styles for Toast

const SellerProfile = () => {
    const { user } = useAuth(); 

    // State to manage profile data and loading
    const [profileData, setProfileData] = useState({
        displayName: '',
        email: '',
        photoURL: '',
    });

    const [imagePreview, setImagePreview] = useState(null); 
    const [file, setFile] = useState(null); 
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        if (user) {
            setProfileData({
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
            });
            setImagePreview(user.photoURL); 
        }
    }, [user]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile); 
            setImagePreview(URL.createObjectURL(selectedFile)); 
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when the update starts

        try {
            if (profileData.email !== user.email) {
                await updateEmail(auth.currentUser, profileData.email);
            }

            let updatedPhotoURL = profileData.photoURL;

            if (file) {
                const fileRef = ref(storage, `profileImages/${auth.currentUser.uid}`); // Ensure storage reference is correct
                await uploadBytes(fileRef, file);
                updatedPhotoURL = await getDownloadURL(fileRef);
            }

            if (profileData.displayName !== user.displayName || updatedPhotoURL !== user.photoURL) {
                await updateProfile(auth.currentUser, {
                    displayName: profileData.displayName,
                    photoURL: updatedPhotoURL,
                });
            }

            // Save the updated profile data to Realtime Database using the user's UID
            const db = getDatabase();
            await set(dbRef(db, `profile/${auth.currentUser.uid}`), { // Use the user's UID for the key
                uid: auth.currentUser.uid, // Include the user's ID
                displayName: profileData.displayName,
                email: profileData.email,
                photoURL: updatedPhotoURL,
            });

            // Show success message
            toast.success('Profile updated successfully!');

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(`Error updating profile: ${error.message}`);
        } finally {
            setLoading(false); // Set loading to false after the update is complete
        }
    };

    return (
        <>
            <ToastContainer /> {/* Add the ToastContainer for displaying notifications */}
            <SellerHeader />
            <div style={{ minHeight: "94vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="Profile-page" style={{ width: "400px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
                    <h3>Seller Profile</h3>
                    {user ? (
                        <form method='POST' onSubmit={handleUpdate}>
                            <div className="alert alert-success mt-3" role="alert">
                                Welcome, {profileData.displayName || profileData.email}
                            </div>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt={`${profileData.displayName}'s profile`}
                                        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                    />
                                ) : (
                                    <p>No profile photo available.</p>
                                )}
                            </div>
                            <div className="mt-3">
                                <label>
                                    Display Name:
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={profileData.displayName}
                                        onChange={handleChange}
                                        style={{ width: '100%', margin: '5px 0', padding: '8px' }}
                                    />
                                </label>
                            </div>
                            <div className="mt-3">
                                <label>
                                    Email:
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        style={{ width: '100%', margin: '5px 0', padding: '8px' }}
                                    />
                                </label>
                            </div>
                            <div className="mt-3">
                                <label>
                                    Photo:
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ width: '100%', margin: '5px 0', padding: '8px' }}
                                    />
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    ) : (
                        <div className="alert alert-danger mt-3" role="alert">
                            No seller logged in.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SellerProfile;
