import React, { useState, useEffect } from "react";
import SellerHeader from "./SellerHeader";
import Footer from "../Dashboard/Footer";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getDatabase, ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from "firebase/auth";  // Import Firebase Auth

const Listings = () => {
    const [formData, setFormData] = useState({
        propertyFor: '',
        propertyType: '',
        city: '',
        address: '',
        state: '',
        ownership: '',
        mobileNo: '',
        saleType: '',
        numberOfFloors: '',
        propertyOnFloor: '',
        carpetArea: '',
        plotArea: '',
        bookingAmount: '',
        numberOfBedrooms: '',
        numberOfBathrooms: '',
        numberOfBalconies: '',
        description: '',
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewURLs, setPreviewURLs] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            alert("You can upload a maximum of 5 images/videos at a time.");
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        const previews = newFiles.map(file => URL.createObjectURL(file));
        setSelectedFiles(newFiles);
        setPreviewURLs(previews);
    };

    const handleRemoveFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previewURLs.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setPreviewURLs(newPreviews);
        alert("File removed successfully.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when submission starts

        const messageId = uuidv4();
        const mediaURLs = [];

        try {
            const storage = getStorage();
            const db = getDatabase();
            const auth = getAuth(); // Get the authenticated user
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User is not authenticated");
            }

            const sellerId = user.uid; // Get the seller's UID

            // Upload each selected file to Firebase Storage
            for (const file of selectedFiles) {
                const fileRef = storageRef(storage, `propertyListings/${messageId}/${file.name}`);
                await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(fileRef);
                mediaURLs.push(downloadURL);
            }

            // Save form data to Firebase Realtime Database with sellerId
            await set(ref(db, 'propertyListings/' + messageId), {
                ...formData,
                messageId,
                mediaURLs,
                sellerId  // Add sellerId here
            });

            toast.success('Property listed successfully!');

            // Reset the form
            setFormData({
                propertyFor: '',
                propertyType: '',
                city: '',
                address: '',
                state: '',
                ownership: '',
                mobileNo: '',
                saleType: '',
                numberOfFloors: '',
                propertyOnFloor: '',
                carpetArea: '',
                plotArea: '',
                bookingAmount: '',
                numberOfBedrooms: '',
                numberOfBathrooms: '',
                numberOfBalconies: '',
                description: '',
            });
            setSelectedFiles([]);
            setPreviewURLs([]);
        } catch (error) {
            console.error('Error listing property:', error);
            toast.error(`Error listing property: ${error.message}`);
        } finally {
            setLoading(false); // Set loading to false when submission ends
        }
    };

    useEffect(() => {
        return () => {
            previewURLs.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewURLs]);

    return (
        <>
            <ToastContainer />

            <SellerHeader />

            <div className="post-property">
                <form onSubmit={handleSubmit} className="property-form">
                    <h2>Property Info & Location</h2>
                    {/* Property Info Fields */}
                    <label>Property For:</label>
                    <select name="propertyFor" value={formData.propertyFor} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="sell">Sell</option>
                        <option value="rent">Rent</option>
                        <option value="pg">PG</option>
                    </select>

                    <label>Property Type:</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="flat">Flat/Apartment</option>
                        <option value="independent House">Independent House</option>
                        <option value="builder Floor">Builder Floor</option>
                        <option value="office Space">Office Space</option>
                        <option value="farm House">Farm House</option>
                        <option value="land Plot">Land/Plot</option>
                    </select>

                    <label>State:</label>
                    <select name="state" value={formData.state} onChange={handleChange}>
                        <option value="">Select State</option>
                        <option value="gujarat">Gujarat</option>
                        <option value="maharashtra">Maharashtra</option>
                        <option value="delhi">Delhi</option>
                        <option value="rajasthan">Rajasthan</option>
                        <option value="goa">Goa</option>
                        <option value="madhyaPradesh">Madhya Pradesh</option>
                        <option value="uttarPradesh">Uttar Pradesh</option>
                        <option value="tamilnadu">Tamil Nadu</option>
                        <option value="kerala">Kerala</option>
                        <option value="karnataka">Karnataka</option>
                    </select>

                    <label>City:</label>
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />

                    <label>Address:</label>
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

                    <label>Mobile No: </label>
                    <input type="text" name="mobileNo" placeholder="Contact No" maxLength="10" value={formData.mobileNo} onChange={handleChange} />

                    <label>Ownership By:</label>
                    <input type="text" name="ownership" placeholder="Owned By" value={formData.ownership} onChange={handleChange} />


                    <h2>Transaction Type & Property Availability</h2>
                    <label>Sale Type:</label>
                    <select name="saleType" value={formData.saleType} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="new">New</option>
                        <option value="resale">Resale</option>
                    </select>

                    <label>Number of Floors:</label>
                    <select name="numberOfFloors" value={formData.numberOfFloors} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>

                    <label>Property on Floor:</label>
                    <select name="propertyOnFloor" value={formData.propertyOnFloor} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="ground">Ground Floor</option>
                        <option value="1st">1st Floor</option>
                        <option value="2nd">2nd Floor</option>
                    </select>



                    <label htmlFor="carpetArea" style={{ display: 'block', marginBottom: '8px' }}>
                        Carpet Area (in sq ft):
                    </label>
                    <input
                        type="number"
                        id="carpetArea"
                        name="carpetArea"
                        value={formData.carpetArea}
                        onChange={handleChange}
                        min="100" // Minimum value for carpet area
                        max="5000" // Maximum value for carpet area
                        placeholder="Enter carpet area (100 - 5000 sq ft)"
                        style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <small style={{ display: 'block', marginBottom: '16px', color: '#666' }}>
                        Please enter a value between 100 and 5000 sq ft.
                    </small>

                    <label>Plot/Land Area:</label>
                    <input type="text" name="plotArea" placeholder="Plot/Land Location" value={formData.plotArea} onChange={handleChange} />

                    <label>Booking Amount:</label>
                    <input type="text" name="bookingAmount" placeholder="Booking Amonut" value={formData.bookingAmount} onChange={handleChange} />


                    <label>Number of Bedrooms:</label>
                    <select name="numberOfBedrooms" value={formData.numberOfBedrooms} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4 BHK</option>
                        <option value="6">6 BHK</option>
                    </select>

                    <label>Number of Bathrooms:</label>
                    <select name="numberOfBathrooms" value={formData.numberOfBathrooms} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>

                    <label>Number of Balconies:</label>
                    <select name="numberOfBalconies" value={formData.numberOfBalconies} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>

                    <h2>Property Description</h2>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        maxLength="2000"
                        placeholder="Tell us more about the property..."
                    ></textarea>

                    <h2>Upload Images/Videos</h2>
                    <input
                        type="file"
                        accept="image/*, video/*"
                        multiple
                        onChange={handleFileChange}
                    />

                    {previewURLs.length > 0 && (
                        <div>
                            <h3>Selected Media:</h3>
                            <div className="media-preview">
                                {previewURLs.map((url, index) => {
                                    const fileType = selectedFiles[index].type;
                                    return (
                                        <div key={index} style={{ margin: "10px", display: "inline-block" }}>
                                            {fileType.startsWith("image/") ? (
                                                <img src={url} alt="Preview" style={{ width: "200px" }} />
                                            ) : (
                                                <video src={url} controls style={{ width: "200px" }} />
                                            )}
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                style={{
                                                    display: "block",
                                                    marginTop: "5px",
                                                    cursor: "pointer",
                                                    padding: "8px 12px",
                                                    backgroundColor: "#e74c3c",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "14px",
                                                    transition: "background-color 0.3s ease",
                                                }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#c0392b"; }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#e74c3c"; }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
                {loading && <div className="loading-overlay">Loading...</div>} {/* Loading overlay */}
            </div>

            <Footer />
        </>
    );
};

export default Listings;
