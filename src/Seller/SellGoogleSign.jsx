import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../Dashboard/firebase"; 
import { toast } from "react-toastify"; 
import GoogleButton from 'react-google-button';

const SellGoogleSign = () => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Seller logged in with Google successfully!", {
        position: "top-center",
      });
      // Redirect to seller-specific dashboard
      window.location.href = "/Listings";
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p className="continue-p">-- Or continue with Seller Login --</p>
      <GoogleButton onClick={handleSignIn} style={{ margin: "20px auto" }} />
    </div>
  );
};

export default SellGoogleSign;
