import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify'; // Import Toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Import styles for Toast
import Navbar from './Navbar';
import Footer from './Footer';
import { getDatabase, ref, set } from 'firebase/database'; // Import Realtime Database functions
import { useAuth } from '../Dashboard/AuthContext'; // Import Auth context to get user info
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating unique IDs

const Contact = () => {
    const { user } = useAuth(); // Get user information
    const [formData, setFormData] = useState({
        name: user?.displayName || '', // Use user's display name if available
        email: user?.email || '',       // Use user's email if available
        mobile: '',
        city: '',
        subject: '',
        message: '',
        uid: user?.uid || '' // Keep user's UID for reference
    });
    const [loading, setLoading] = useState(false); // Loading state

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when form is submitted

        // Create a unique ID for the contact message
        const messageId = uuidv4(); // Generate a unique message ID

        try {
            // Save form data to Firebase Realtime Database
            const db = getDatabase();
            await set(ref(db, 'contactMessages/' + messageId), { ...formData, messageId }); // Save form data with unique message ID
            toast.success('Message sent successfully!'); // Show success message
            
            // Reset the form
            setFormData({ 
                name: user?.displayName || '', 
                email: user?.email || '', 
                mobile: '', 
                city: '', 
                subject: '', 
                message: '', 
                uid: user?.uid || '' 
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(`Error sending message: ${error.message}`); // Show error message
        } finally {
            setLoading(false); // Set loading to false after the operation
        }
    };

    return (
        <>
            <ToastContainer /> {/* Add the ToastContainer for displaying notifications */}
            <Navbar />

            <div className="contact-form-container">
                <div className="contact-header">
                    <h2>Joy is just a click away</h2>
                    <h3>Let's get started</h3>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="message"
                        placeholder="Message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Submit'}
                    </button>
                </form>

                <div className="contact-info">
                    <p>You can also reach out to us at <a href="mailto:customer.service@Real-Estate.com">customer.service@Real-Estate.com</a></p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Contact;
