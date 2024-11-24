
import React, { useState, useEffect } from "react";
import BuyerHeader from "./BuyerHeader";
import Footer from "../Dashboard/Footer";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { Grid, Card, CardContent, CardMedia, Typography, TextField, CircularProgress, Box, Button, FormControl, InputLabel, Select, MenuItem, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Dashboard/AuthContext'; // Import authentication context
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const Properties = () => {
    const { user } = useAuth(); // Get authenticated user information
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState(new Set());

    // State for filters
    const [formData, setFormData] = useState({
        propertyFor: "",
        propertyType: "",
        state: "",
        saleType: "",
        numberOfBedrooms: "",
        bookingAmount: "",
        mobileNo: "",
    });

    const navigate = useNavigate();
    const userId = user?.uid; // Use authenticated user ID

    useEffect(() => {
        const db = getDatabase();
        const propertiesRef = ref(db, 'propertyListings');

        onValue(propertiesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const propertyList = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setProperties(propertyList);
                setFilteredProperties(propertyList);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching properties:", error);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (userId) {
            const db = getDatabase();
            const favoritesRef = ref(db, `favorites/${userId}`);

            onValue(favoritesRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const favoriteIds = new Set(Object.keys(data));
                    setFavorites(favoriteIds);
                }
            });
        }
    }, [userId]);



    const applyFilters = () => {
        const filtered = properties.filter(property => {
            const matchesSearchTerm = (
                property.city?.toLowerCase().includes(searchTerm) || // Assuming you have a city field in property
                property.state?.toLowerCase().includes(searchTerm) ||
                property.propertyFor?.toLowerCase().includes(searchTerm) ||
                property.propertyType?.toLowerCase().includes(searchTerm) ||
                property.saleType?.toLowerCase().includes(searchTerm) ||
                property.numberOfBedrooms?.toLowerCase().includes(searchTerm) ||
                (property.bookingAmount && property.bookingAmount <= Number(formData.bookingAmount)) // Assuming bookingAmount is a number
            );
            const matchesFormData = (
                (formData.propertyFor ? property.propertyFor === formData.propertyFor : true) &&
                (formData.propertyType ? property.propertyType === formData.propertyType : true) &&
                (formData.state ? property.state === formData.state : true) &&
                (formData.saleType ? property.saleType === formData.saleType : true) &&
                (formData.numberOfBedrooms ? property.numberOfBedrooms === formData.numberOfBedrooms : true) &&
                (formData.bookingAmount ? property.bookingAmount <= Number(formData.bookingAmount) : true)
            );

            return matchesSearchTerm && matchesFormData;
        });
        setFilteredProperties(filtered);
    };


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        applyFilters();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };


    const handlePropertyClick = (property) => {
        navigate('/property-details', { state: { selectedProperty: property } });
    };

    const toggleFavorite = (propertyId) => {
        const db = getDatabase();
        const favoriteRef = ref(db, `favorites/${userId}/${propertyId}`);

        if (favorites.has(propertyId)) {
            set(favoriteRef, null).then(() => {
                const newFavorites = new Set(favorites);
                newFavorites.delete(propertyId);
                setFavorites(newFavorites);
            }).catch((error) => console.error("Error removing favorite:", error));
        } else {
            set(favoriteRef, true).then(() => {
                const newFavorites = new Set(favorites);
                newFavorites.add(propertyId);
                setFavorites(newFavorites);
            }).catch((error) => console.error("Error adding favorite:", error));
        }
    };

    return (


        <>
            <BuyerHeader />
            <div style={{ padding: "20px" }}>
                <div className="Filter-Properties">
                    <div className="MarginTop" style={{ marginTop: "10vh" }}>
                        <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: "bold", marginBottom: "1%" }}>
                            Available Properties
                        </Typography>

                        <Box sx={{ width: "100%", position: 'sticky', top: 80, zIndex: 1000, backgroundColor: 'white', marginBottom: 5, boxShadow: 4, padding: "10px" }}>
                            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                                {/* Search Bar */}
                                <Grid className=" Search-Bar" item>
                                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            variant="outlined"
                                            placeholder="Search properties..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            sx={{
                                                width: "300px",
                                                fontWeight: "bold",
                                                fontSize: "1.5rem",
                                                color: "black",
                                                "& .MuiInputBase-input::placeholder": {
                                                    fontWeight: "bold",
                                                    color: "black",
                                                    fontSize: "1.2rem", // Adjust the font size of the placeholder
                                                },
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            className="Search-Btn"
                                            variant="contained"
                                            color="primary"
                                            sx={{
                                                marginLeft: 3,
                                                fontWeight: "bold",
                                                fontSize: "1rem",
                                                padding: "10px 20px",
                                            }}
                                        >
                                            Search
                                        </Button>
                                    </form>
                                </Grid>

                                {/* Property For Filter */}
                                <Grid item>
                                    <FormControl className="Filters" sx={{ minWidth: "120px" }}>
                                        <InputLabel sx={{ fontWeight: "bold", color: "black", fontSize: "1.2rem" }}>Property For</InputLabel>
                                        <Select
                                            name="propertyFor"
                                            value={formData.propertyFor}
                                            onChange={handleChange}
                                            sx={{ fontWeight: "bold", fontSize: "1.2rem", color: "black" }}
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="sell">Sell</MenuItem>
                                            <MenuItem value="rent">Rent</MenuItem>
                                            <MenuItem value="pg">PG</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Property Type Filter */}
                                <Grid item>
                                    <FormControl className="Filter-1" sx={{ minWidth: "140px" }}>
                                        <InputLabel sx={{ fontWeight: "bold", color: "black", fontSize: "1.2rem" }}>Property Type</InputLabel>
                                        <Select
                                            name="propertyType"
                                            value={formData.propertyType}
                                            onChange={handleChange}
                                            sx={{ fontWeight: "bold", fontSize: "1rem", color: "black" }}
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="flat">Flat/Apartment</MenuItem>
                                            <MenuItem value="independent House">Independent House</MenuItem>
                                            <MenuItem value="builder Floor">Builder Floor</MenuItem>
                                            <MenuItem value="office Space">Office Space</MenuItem>
                                            <MenuItem value="farm House">Farm House</MenuItem>
                                            <MenuItem value="land Plot">Land/Plot</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* State Filter */}
                                <Grid item>
                                    <FormControl className="Filters" sx={{ minWidth: "120px" }}>
                                        <InputLabel sx={{ fontWeight: "bold", color: "black", fontSize: "1.2rem" }}>State</InputLabel>
                                        <Select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            sx={{ fontWeight: "bold", fontSize: "1rem", color: "black" }}
                                        >
                                            <MenuItem value="">Select State</MenuItem>
                                            <MenuItem value="gujarat">Gujarat</MenuItem>
                                            <MenuItem value="maharashtra">Maharashtra</MenuItem>
                                            <MenuItem value="delhi">Delhi</MenuItem>
                                            <MenuItem value="rajasthan">Rajasthan</MenuItem>
                                            <MenuItem value="goa">Goa</MenuItem>
                                            <MenuItem value="madhyaPradesh">Madhya Pradesh</MenuItem>
                                            <MenuItem value="uttarPradesh">Uttar Pradesh</MenuItem>
                                            <MenuItem value="tamilnadu">Tamil Nadu</MenuItem>
                                            <MenuItem value="kerala">Kerala</MenuItem>
                                            <MenuItem value="karnataka">Karnataka</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Sale Type Filter */}
                                <Grid item>
                                    <FormControl className="filter0" sx={{ minWidth: "140px" }}>
                                        <InputLabel sx={{ fontWeight: "bold", color: "black", fontSize: "1.2rem" }}>Sale Type</InputLabel>
                                        <Select
                                            name="saleType"
                                            value={formData.saleType}
                                            onChange={handleChange}
                                            sx={{ fontWeight: "bold", fontSize: "1rem", color: "black" }}
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="new">New</MenuItem>
                                            <MenuItem value="resale">Resale</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Number of Bedrooms Filter */}
                                <Grid item>
                                    <FormControl className="Filters1" sx={{ minWidth: "140px" }}>
                                        <InputLabel sx={{ fontWeight: "bold", color: "black", fontSize: "1.2rem" }}>Number of Bedrooms</InputLabel>
                                        <Select
                                            name="numberOfBedrooms"
                                            value={formData.numberOfBedrooms}
                                            onChange={handleChange}
                                            sx={{ fontWeight: "bold", fontSize: "1rem", color: "black" }}
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="1">1 BHK</MenuItem>
                                            <MenuItem value="2">2 BHK</MenuItem>
                                            <MenuItem value="3">3 BHK</MenuItem>
                                            <MenuItem value="4">4 BHK</MenuItem>
                                            <MenuItem value="6">6 BHK</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Max Booking Amount Filter */}
                                <Grid item>
                                    <TextField
                                        className="Filters-2"
                                        variant="outlined"
                                        name="bookingAmount"
                                        placeholder="Max Booking Amount"
                                        value={formData.bookingAmount}
                                        onChange={handleChange}
                                
                                    />
                                </Grid>

                                {/* Apply Filters Button */}
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        className="apply-filters"
                                        color="primary"
                                        onClick={applyFilters}
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            padding: "10px 20px",
                                        }}
                                    >
                                        Apply Filters
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>


                    </div>

                    {loading ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            style={{ height: '60vh' }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container justifyContent="center" spacing={4}>
                            {filteredProperties.length > 0 ? (
                                filteredProperties.map((property) => (
                                    <Grid item xs={12} sm={10} md={8} key={property.id}>
                                        <Card sx={{ maxWidth: 1200, marginBottom: 3, cursor: 'pointer' }} onClick={() => handlePropertyClick(property)}>
                                            {property.mediaURLs && property.mediaURLs[0] ? (
                                                <CardMedia
                                                    component={property.mediaURLs[0].includes(".mp4") ? "video" : "img"}
                                                    height="250"
                                                    image={property.mediaURLs[0]}
                                                    alt="Property Image"
                                                    controls={property.mediaURLs[0].includes('.mp4')}
                                                    sx={{ objectFit: "cover" }}
                                                />
                                            ) : (
                                                <CardMedia
                                                    component="img"
                                                    height="250"
                                                    image="/static/images/cards/default.jpg" // Placeholder image
                                                    alt="No Image Available"
                                                />
                                            )}

                                            <CardContent>
                                                <Typography
                                                    gutterBottom
                                                    variant="h5"
                                                    component="div"
                                                    sx={{ fontWeight: "bold", fontSize: "2.5rem" }}
                                                >
                                                    {property.propertyType} for {property.propertyFor}
                                                </Typography>

                                                {/* Flex container to divide the content equally */}
                                                <div className="property-list">

                                                    {/* Left section */}
                                                    <div style={{ flex: 1, marginRight: '20%' }}>
                                                        <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                                                            Sale Type: {property.saleType}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                                                            City: {property.city}, State: {property.state}
                                                        </Typography>

                                                        <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                                                            Mobile No: {property.mobileNo}
                                                        </Typography>
                                                    </div>

                                                    {/* Right section */}
                                                    <div className="property-list-R" >
                                                        <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                                                            Carpet Area: {property.carpetArea} sqft
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                                                            Booking Amount: ₹{property.bookingAmount}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                                                            Ownership: {property.ownership}
                                                        </Typography>
                                                    </div>
                                                </div>

                                                {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Button
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
                                                        sx={{
                                                            marginLeft: 'auto', 
                                                            padding: '16px 24px',
                                                            fontSize: '1.75rem', 
                                                            minWidth: '100px', 
                                                        }}
                                                    >
                                                        {favorites.has(property.id) ?
                                                            <FavoriteIcon color="error" fontSize="large" /> :
                                                            <FavoriteBorderIcon fontSize="large" />
                                                        }
                                                    </Button>
                                                </div> */}


                                            </CardContent>

                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Typography align="center">No properties found</Typography>
                            )}
                        </Grid>
                    )}
                </div>
            </div>
            <Footer />
        </>

    );
};

export default Properties;
