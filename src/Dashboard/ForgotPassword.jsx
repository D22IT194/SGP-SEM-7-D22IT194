import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.jsx"; // Adjust the import path as needed
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address", { position: "bottom-center" });
      return;
    }

    setIsLoading(true);  // Start the loader
    try {
      await sendPasswordResetEmail(auth, email);
      // Simulate a delay of 5 seconds before navigating
      setTimeout(() => {
        navigate('/Login'); // Redirect to login after 5 seconds
      }, 2000); 
      toast.success("Password reset email sent! Please check your inbox.", { position: "top-center" });
      
    } catch (error) {
      console.log("Error Code:", error.code);
      handleErrorToast(error.code);
    } finally {
      // Keep loader on for 5 seconds, then stop it
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); 
    }
  };

  const handleErrorToast = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        toast.error("The email address is not valid.", { position: "bottom-center" });
        break;
      case 'auth/user-not-found':
        toast.error("No user found with this email.", { position: "bottom-center" });
        break;
      default:
        toast.error("Failed to send password reset email. Please try again.", { position: "bottom-center" });
        break;
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "94vh", display: "flex", flexDirection: "column" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: "1" }}>
          <div className="Login-page" style={{ width: "400px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
            <h3>Forgot Password</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Email address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </>
  );
}

export default ForgotPassword;
