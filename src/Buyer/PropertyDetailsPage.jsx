import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useLocation } from 'react-router-dom';
import { Typography, Box, CircularProgress } from '@mui/material'; // Import CircularProgress for loader
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Footer from '../Dashboard/Footer';
import BuyerHeader from './BuyerHeader';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import '../index.css';
import Feedback from './Feedback';
import BuyerSellerChat from '../Dashboard/BuyerSellerChat';
import ChatRoom from '../Dashboard/ChatRooom';

// Custom Arrow Component for Slider
const CustomArrow = ({ className, style, onClick, icon }) => {
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                zIndex: 1,
                cursor: 'pointer',
                transition: 'background 0.3s, transform 0.3s',
            }}
            onClick={onClick}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
        >
            {icon}
        </div>
    );
};

// PropertyDetailsPage Component
const PropertyDetailsPage = () => {
    const location = useLocation();
    const { selectedProperty } = location.state || {};
    const [loading, setLoading] = useState(true); // State for loading

    useEffect(() => {
        // Simulate data fetching
        const timer = setTimeout(() => {
            setLoading(false); // Set loading to false after data is "fetched"
        }, 1000); // Simulate a 1-second loading time

        return () => clearTimeout(timer); // Cleanup timer on component unmount
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress /> {/* Loader while fetching data */}
            </Box>
        );
    }

    if (!selectedProperty) {
        return <Typography variant="h6">No property details available.</Typography>;
    }

    // Slider settings
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        nextArrow: <CustomArrow icon={<ArrowCircleRightIcon />} />,
        prevArrow: <CustomArrow icon={<ArrowCircleLeftIcon />} />,
    };

    return (
        <>
            <BuyerHeader />

            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <Typography variant="h4" gutterBottom>
                        {selectedProperty.propertyType} for {selectedProperty.propertyFor}
                    </Typography>

                    {selectedProperty.mediaURLs && (
                        <div style={{ marginTop: '10vh' }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#333", fontSize: "2.0rem" }}>
                                Media:
                            </Typography>
                            <Slider {...settings}>
                                {selectedProperty.mediaURLs.map((url, index) => (
                                    <div key={index} style={{ margin: "10px", textAlign: 'center' }}>
                                        {url.includes(".mp4") ? (
                                            <video
                                                src={url}
                                                controls
                                                style={{ width: "100%", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <img
                                                src={url}
                                                alt="Property Media"
                                                style={{ width: "100%", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    )}



                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            textAlign: "justify",
                            fontSize: "2.0rem",
                            fontWeight: 'bold',
                            marginTop: '36px',
                            color: "#333"
                        }}
                    >
                        <>Description:</> <div className='Prop-detail-desc' >{selectedProperty.description} </div>
                    </Typography>



                    <Box className='Prop_desc' >
                        <Box flex={1} marginRight="8px">
                            <Typography variant="h6" gutterBottom sx={{ fontSize: "20px ", fontWeight: 'bold', color: "#444" }}>
                                Property Details
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Sale Type:</> {selectedProperty.saleType}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Carpet Area (sq ft):</> {selectedProperty.carpetArea}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Booking Amount:</> {selectedProperty.bookingAmount}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Ownership:</> {selectedProperty.ownership}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Plot Area:</> {selectedProperty.plotArea}
                            </Typography>

                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>City:</> {selectedProperty.city}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>State:</> {selectedProperty.state}
                            </Typography>
                        </Box>

                        <Box className="Prop_desc-R" >
                            <Typography variant="h6" gutterBottom sx={{ fontSize: "20px ", fontWeight: 'bold', color: "#444" }}>
                                Additional Information
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Number of Floors:</> {selectedProperty.numberOfFloors}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Property on Floor:</> {selectedProperty.propertyOnFloor}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Number of Balconies:</> {selectedProperty.numberOfBalconies}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Number of Bedrooms:</> {selectedProperty.numberOfBedrooms}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Number of Bathrooms:</> {selectedProperty.numberOfBathrooms}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Address:</> {selectedProperty.address}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ textAlign: "justify", fontSize: "1.3rem", fontWeight: 'bold', mb: 1 }}>
                                <>Contact No:</> {selectedProperty.mobileNo}
                            </Typography>
                        </Box>
                    </Box>
                </div>
            </div>

            {/* <p className="forgot-password text-right">
            Chat <a href="./BuyerSellerChat">Click Here</a>
            </p> */}
            {/* <Feedback/> */}
            <Footer />
        </>
    );
};

export default PropertyDetailsPage;
