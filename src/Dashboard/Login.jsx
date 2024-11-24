import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignInWithGoogle from "../Buyer/signInWithGoogle.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { getDatabase, ref, set } from "firebase/database"; // Import Firebase database

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/Properties');
    }
  }, [user, navigate]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address", { position: "bottom-center" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Get the unique user ID

      // Optionally save buyer details in the database
      const db = getDatabase();
      await set(ref(db, 'login/' + userId), {
        email: email,
        buyerId: userId,
        password: password
        // You can add more user details here
      });

      navigate('/Properties');
      toast.success("User logged in successfully!", { position: "top-center" });
    } catch (error) {
      console.log("Error Code:", error.code);
      console.log("Error Message:", error.message);
      handleErrorToast(error.code);
    } finally {
      setIsLoading(false);
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
      case 'auth/wrong-password':
        toast.error("Incorrect password. Please try again.", { position: "bottom-center" });
        break;
      case 'auth/invalid-credential':
        toast.error("Invalid credential. Please check your email and password.", { position: "bottom-center" });
        break;
      default:
        toast.error("Login failed. Please check your credentials.", { position: "bottom-center" });
        break;
    }
  };

  return (
    <>

      <Navbar />
      <div style={{ minHeight: "94vh", display: "flex", flexDirection: "column" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: "1" }}>
          <div className="Login-page" style={{ width: "400px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
            <h3 className="Buyer_login">Buyer Login</h3>

            {!user && (
              <>
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
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>

                <SignInWithGoogle />

                <p className="forgot-password text-right">
                  New user <a href="./register">Register Here</a>
                </p>
              </>
            )}

            <p className="forgot-password text-right">
              Seller Login <a href="./Seller">Click Here</a>
            </p>

            <p className="forgot-password text-right">
              Forgot Password? <a href="./ForgotPassword">Click Here</a>
            </p>

          </div>
        </div>

      </div>

      <Footer />

      <ToastContainer />

    </>
  );
}

export default Login;
