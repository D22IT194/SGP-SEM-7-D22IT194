import React, { useEffect, useState } from 'react';
import { useAuth } from '../Dashboard/AuthContext';
import BuyerHeader from './BuyerHeader';
import Footer from '../Dashboard/Footer';
import { updateEmail, updateProfile } from 'firebase/auth'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { auth, storage } from '../Seller/Firebase'; // Ensure Firebase storage is imported
import { getDatabase, ref as dbRef, set } from 'firebase/database'; // Import Realtime Database functions
import { toast, ToastContainer } from 'react-toastify'; // Import Toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Import styles for Toast

const Profile = () => {
    const { user } = useAuth(); // Get user information from Auth context

    // State to manage profile data
    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        photoURL: user?.photoURL || '',
    });

    const [imagePreview, setImagePreview] = useState(user?.photoURL || null); // Initialize with user's photo URL
    const [file, setFile] = useState(null); // State to hold the file object
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

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile); 
            setImagePreview(URL.createObjectURL(selectedFile)); // Set the preview
        }
    };

    // Handle update profile
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when update starts

        try {
            // Update email if it has changed
            if (profileData.email !== user.email) {
                await updateEmail(auth.currentUser, profileData.email);
            }

            let updatedPhotoURL = profileData.photoURL;

            // Upload new profile photo if a file is selected
            if (file) {
                const fileRef = ref(storage, `profileImages/${auth.currentUser.uid}`); // Reference to storage
                await uploadBytes(fileRef, file);
                updatedPhotoURL = await getDownloadURL(fileRef);
            }

            // Update profile information in Firebase Auth
            if (profileData.displayName !== user.displayName || updatedPhotoURL !== user.photoURL) {
                await updateProfile(auth.currentUser, {
                    displayName: profileData.displayName,
                    photoURL: updatedPhotoURL,
                });
            }

            // Save the updated profile data to Realtime Database
            const db = getDatabase();
            await set(dbRef(db, 'profile/' + auth.currentUser.uid), {
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
            setLoading(false); // Set loading to false when update finishes
        }
    };

    return (
        <>
            <ToastContainer /> {/* Add the ToastContainer for displaying notifications */}
            <BuyerHeader />
            <div style={{ minHeight: "94vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="Profile-page" style={{ width: "400px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
                    <h3>Profile</h3>
                    {user ? (
                        <form onSubmit={handleUpdate}>
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
                                        disabled={loading} // Disable input during loading
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
                                        disabled={loading} // Disable input during loading
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
                                        disabled={loading} // Disable file input during loading
                                    />
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'} {/* Change button text when loading */}
                            </button>
                        </form>
                    ) : (
                        <div className="alert alert-danger mt-3" role="alert">
                            No user logged in.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;
