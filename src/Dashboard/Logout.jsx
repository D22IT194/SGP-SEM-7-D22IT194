import React, { useState } from 'react';
import { signOut } from 'firebase/auth'; 
import { auth } from './firebase';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const LogoutButton = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully", { position: "top-center" }); 
            navigate('/'); 
        } catch (error) {
            console.log(error.message);
            toast.error("Logout failed: " + error.message, { position: "bottom-center" }); 
        } finally {
            handleClose(); // Close dialog after logout attempt
        }
    };

    return (
        <div className='logout-btn'>
            <Button
                variant="contained"
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    width: '100%',
                    marginTop: '10px',
                    fontFamily: 'MyCustomFont' 
                }}
                onClick={handleClickOpen}
            >
                Logout
            </Button>

            <Dialog open={open} onClose={handleClose} >
                <DialogTitle style={{fontSize: "20px", fontWeight: "bold"}}>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{fontSize: "15px", fontWeight: "bold"}}>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'space-between' }}>
    <Button 
        onClick={handleClose} 
        color="secondary" 
        variant="outlined"
        style={{
            borderColor: '#f44336',
            color: '#f44336',
            fontWeight: 'bold',
            textTransform: 'none',
            marginRight: '5px',
            fontSize: '15px', // Increase font size
            padding: '5px 10px', // Increase height with padding
            maxWidth: '120px', // Set minimum width
        }}
    >
        Cancel
    </Button>
    <Button 
        onClick={handleLogout} 
        color="primary" 
        variant="contained"
        style={{
            backgroundColor: '#f44336',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            marginLeft: '5px',
            fontSize: '15px', // Increase font size
            padding: '5px 10px', // Increase height with padding
            maxWidth: '120px', // Set minimum width
        }}
    >
        Yes, Logout
    </Button>
</DialogActions>

            </Dialog>

            <ToastContainer />
        </div>
    );
};

export default LogoutButton;
