import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../Dashboard/firebase"; 
import { toast } from "react-toastify"; 
import GoogleButton from 'react-google-button';

const SignInWithGoogle = () => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Access the user object
      toast.success("User logged in with Google successfully!", {
        position: "top-center",
      });
      window.location.href = "/Properties"; // Navigate to properties after login
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p className="continue-p">-- Or continue with --</p>
      <GoogleButton onClick={handleSignIn} style={{ margin: "20px auto" }} />
    </div>
  );
};

export default SignInWithGoogle;
