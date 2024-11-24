import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import reactLogo from '../assets/logo.png';
import { useAuth } from '../Dashboard/AuthContext';
import LogoutButton from '../Dashboard/Logout';
import { Avatar, Popover, Typography, Button, Divider } from '@mui/material';

const SellerHeader = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();

    const openNav = () => {
        setIsMenuOpen(true);
    };

    const closeNav = () => {
        setIsMenuOpen(false);
    };

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'profile-popover' : undefined;

    return (
        <header className="header-bar">
            <div className="logo">
                <img className="real-logo" src={reactLogo} alt="Real-Estate" />
            </div>

            <div id="main">
                <button className="openbtn" onClick={openNav} aria-label="Open Navigation Menu">☰</button>
            </div>

            <div className="pages" id="pages" style={{ width: isMenuOpen ? '250px' : '', display: isMenuOpen ? 'block' : '' }}>
                <div className="clsbtn">
                    <button className="closebtn" onClick={closeNav} aria-label="Close Navigation Menu">×</button>
                </div>

                {user ? (
                    <div className='seller-header_components'>
                        <ul>
                            <Link to='/listings'><li className="Listings">Post Property</li></Link>
                            <Link to='/MyListings'><li className="Sales-Overview">My Listings</li></Link>
                        </ul>
                    </div>
                ) : (
                    <div className="alert alert-danger mt-3" role="alert">
                        <li className='Nouser-err'>No user logged in.</li>
                    </div>
                )}
            </div>

            {user && (
                <div className="avatar-container" style={{ margin: '1vh auto 0 2vh', padding: '10px' }}>
                    <Avatar
                        alt={user.displayName || "User Profile"}
                        src={user.photoURL || 'https://via.placeholder.com/50'}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
                        onClick={handleProfileClick}
                    />
                </div>
            )}

            {/* Profile Popover */}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div style={{ padding: '20px', textAlign: 'center', minWidth: '200px', fontFamily: 'MyCustomFont' }}>
                    <Avatar
                        alt={user ? user.displayName || 'User' : 'User'}
                        src={user ? user.photoURL || 'https://via.placeholder.com/50' : 'https://via.placeholder.com/50'}
                        style={{ width: '50px', height: '50px', margin: '10px auto' }}
                    />
                    <Typography variant="h6" style={{fontFamily: 'MyCustomFont'}}>{user ? user.displayName || user.email : 'Guest'}</Typography>

                    <Divider style={{ margin: '10px 0' }} />
                    <Link to='/SellerProfile'>
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ width: '100%',fontFamily: 'MyCustomFont' }}
                        >
                            View Profile
                        </Button>
                    </Link>
                    <LogoutButton />
                </div>
            </Popover>
        </header>
    );
};

export default SellerHeader;
