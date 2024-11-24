import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.jsx";
import { Snackbar, Button, CircularProgress } from "@mui/material";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import SellGooglesign from "../Seller/SellGoogleSign.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

function Seller() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/Listings"); // Redirect to seller listings/dashboard after login
    }
  }, [user, navigate]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      showSnackbar("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Optionally save seller details in the database
      const db = getDatabase();
      await set(ref(db, "sellerLogin/" + userId), {
        email: email,
        sellerId: userId,
        password: password 
        // Avoid storing plain text password; this is just for example
      });

      setUser(userCredential.user);
      showSnackbar("Seller logged in successfully!", "success");
    } catch (error) {
      handleErrorSnackbar(error.code);
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message, type = "error") => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleErrorSnackbar = (errorCode) => {
    const errorMessages = {
      "auth/invalid-email": "The email address is not valid.",
      "auth/user-not-found": "No user found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Invalid credential. Please check your email and password.",
    };

    const errorMessage = errorMessages[errorCode] || "Login failed. Please check your credentials.";
    showSnackbar(errorMessage);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Navbar />

      <div style={{ minHeight: "94vh", display: "flex", flexDirection: "column" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: "1" }}
        >
          <form
            className="Login-page"
            onSubmit={handleSubmit}
            style={{
              width: "400px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Seller Login</h3>

            {!user && (
              <>
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

                <div className="mb-3">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : "Submit"}
                  </button>
                </div>

                <SellGooglesign />
              </>
            )}

            <p className="forgot-password text-right">
              New seller? <a href="./register">Register Here</a>
            </p>

            <p className="forgot-password text-right">
              Buyer Login <a href="./Login">Click Here</a>
            </p>

            <p className="forgot-password text-right">
              Forgot Password? <a href="./ForgotPassword">Click Here</a>
            </p>
          </form>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </div>
      <Footer />
    </>
  );
}

export default Seller;
