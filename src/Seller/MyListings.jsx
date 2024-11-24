import React, { useState, useEffect } from 'react';
import Footer from "../Dashboard/Footer";
import SellerHeader from "./SellerHeader";
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    Card, CardContent, CardMedia, Typography, Grid, Dialog, InputLabel, MenuItem,
    DialogTitle, DialogContent, Button, TextField, IconButton, Snackbar, Alert,
    DialogActions, CircularProgress, CardActions, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [listingData, setListingData] = useState({
        id: '',
        propertyFor: '',
        propertyType: '',
        city: '',
        address: '',
        state: '',
        ownership: '',
        mobileNo: '',
        saleType: '',
        numberOfFloors: '',
        propertyOnFloor: '',
        carpetArea: '',
        plotArea: '',
        bookingAmount: '',
        numberOfBedrooms: '',
        numberOfBathrooms: '',
        numberOfBalconies: '',
        description: '',
        mediaURLs: []
    });
    const [uploadProgress, setUploadProgress] = useState(null);
    const [previews, setPreviews] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // New state for uploading
    const [uploadingFiles, setUploadingFiles] = useState([]);


    const db = getDatabase();
    const auth = getAuth();
    const storage = getStorage();

    useEffect(() => {
        const fetchSellerProperties = async (user) => {
            try {
                const listingsRef = ref(db, 'propertyListings');
                onValue(listingsRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const listingsArray = Object.entries(data)
                            .map(([id, details]) => ({ id, ...details }))
                            .filter((listing) => listing.sellerId === user.uid);
                        setListings(listingsArray);
                    } else {
                        setListings([]);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error fetching properties:", error);
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchSellerProperties(user);
            } else {
                setAuthError('User not authenticated. Please log in.');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, db]);

    const handleOpen = (listing) => {
        setSelectedListing(listing);
        setEditMode(false);
        setListingData(listing);
        setPreviews(listing.mediaURLs);
    };

    const handleClose = () => {
        setSelectedListing(null);
        setEditMode(false);
        setPreviews([]);
    };

    const handleEdit = (listing) => {
        setListingData({ ...listing });
        setEditMode(true);
        setSelectedListing(listing);
        setPreviews(listing.mediaURLs);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setListingData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        const newMediaURLs = [];
        setIsUploading(true); // Start the uploading process

        const updatedUploadingFiles = []; // Create an array to hold upload states

        files.forEach((file, index) => {
            updatedUploadingFiles[index] = true; // Mark this file as uploading
            const fileRef = storageRef(storage, `propertyListings/${listingData.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`); // Logging progress here
                },
                (error) => {
                    console.error("Error uploading file:", error);
                    setSnackbarMessage('Error uploading file.');
                    setSnackbarSeverity('error');
                    setOpenSnackbar(true);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    newMediaURLs.push(downloadURL);
                    console.log("File available at", downloadURL);

                    // Save new media URLs
                    setListingData((prevData) => ({
                        ...prevData,
                        mediaURLs: [...prevData.mediaURLs, ...newMediaURLs],
                    }));

                    // Mark this file as uploaded
                    updatedUploadingFiles[index] = false; // Mark the upload as complete

                    // Check if all uploads are finished
                    if (updatedUploadingFiles.every((status) => !status)) {
                        setIsUploading(false); // End the uploading process if all are done
                    }
                }
            );
        });

        setUploadingFiles(updatedUploadingFiles); // Update the state with upload statuses
        setPreviews((prev) => [...prev, ...newPreviews]);
    };


    const handleSave = async () => {
        setLoading(true);
        const messageId = editMode ? listingData.id : uuidv4(); // Use existing ID if editing
        const mediaURLs = editMode ? listingData.mediaURLs : []; // Preserve existing media URLs if editing

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User is not authenticated");
            }

            const sellerId = user.uid; // Get the seller's UID

            // Save form data to Firebase Realtime Database with sellerId
            await set(ref(db, 'propertyListings/' + messageId), {
                ...listingData,
                id: messageId,
                mediaURLs,
                sellerId,
            });

            setSnackbarMessage(editMode ? 'Listing updated successfully!' : 'Property listed successfully!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            setEditMode(false);
            setSelectedListing(null);
        } catch (error) {
            console.error("Error saving listing:", error);
            setSnackbarMessage('Error saving listing.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        const listingRef = ref(db, `propertyListings/${id}`);
        remove(listingRef).then(() => {
            setSnackbarMessage('Listing deleted successfully!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            setSelectedListing(null);
        }).catch((error) => {
            console.error("Error deleting listing:", error);
            setSnackbarMessage('Error deleting listing.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        });
    };

    const handleRemoveMedia = (index) => {
        if (index < 0 || index >= listingData.mediaURLs.length) {
            console.error('Index out of bounds:', index);
            return;
        }

        const mediaURL = listingData.mediaURLs[index];
        const fileRef = storageRef(storage, mediaURL);

        deleteObject(fileRef)
            .then(() => {
                setListingData((prevData) => ({
                    ...prevData,
                    mediaURLs: prevData.mediaURLs.filter((_, i) => i !== index),
                }));
                setPreviews((prev) => prev.filter((_, i) => i !== index));
                setSnackbarMessage('Media removed successfully.');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
            })
            .catch((error) => {
                console.error("Error removing media:", error);
                setSnackbarMessage('Error removing media.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleOpenDeleteDialog = (listing) => {
        setListingToDelete(listing);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setListingToDelete(null);
    };

    const confirmDelete = () => {
        if (listingToDelete) {
            handleDelete(listingToDelete.id);
        }
        handleCloseDeleteDialog();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (authError) {
        return <div>{authError}</div>;
    }

    return (
        <div>
            <SellerHeader />
            <div className="my-listings" style={{ padding: "20px" }}>
                <Typography
                    variant="h4"
                    sx={{
                        marginTop: "12vh",
                        textAlign: "center",       // Centers the text horizontally
                        fontWeight: "bold",
                        marginBottom: "5vh"        // Makes the text bold
                    }}
                    gutterBottom
                >
                    My Property Listings
                </Typography>

                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        style={{ height: '60vh' }}
                    >
                        <CircularProgress />
                    </Box>
                ) : listings.length > 0 ? (
                    <Grid container justifyContent="center" spacing={3}>
                        {listings.map((listing) => (
                            <Grid item xs={12} sm={10} md={8} key={listing.id}>
                                <Card sx={{ maxWidth: 1200, marginBottom: 2 }}>
                                    <CardMedia
                                        component={listing.mediaURLs[0]?.includes(".mp4") ? "video" : "img"}
                                        sx={{
                                            width: '100%',  // Set the width to 100% of the parent container
                                            height: '200px', // Fixed height for both video and image
                                            objectFit: 'cover', // Ensure the content covers the area without distortion
                                        }}
                                        image={listing.mediaURLs[0] || '/static/images/cards/default.jpg'}
                                        alt="Property"
                                        controls={listing.mediaURLs[0].includes('.mp4')}

                                    />



                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="h5"
                                            component="div"

                                        >
                                            <div className='My-Listing-Title'> {listing.propertyType} For {listing.propertyFor}</div>
                                        </Typography>

                                        <div className='My-Listing-info' > {/* Flex container to align left and right sections */}
                                            <div style={{ flex: 1, marginRight: '40px' }}> {/* Left section */}
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: "bold", fontSize: "1.4rem" }}
                                                >
                                                    Sale Type: {listing.saleType}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: "bold", fontSize: "1.4rem" }}
                                                >
                                                    City: {listing.city}
                                                </Typography>
                                            </div>

                                            <div className='My-Listing-R' > {/* Right section */}
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: "bold", fontSize: "1.4rem" }}
                                                >
                                                    Booking Amount: {listing.bookingAmount}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: "bold", fontSize: "1.4rem" }}
                                                >
                                                    Carpet Area: {listing.carpetArea} sqft
                                                </Typography>
                                            </div>
                                        </div>


                                        <CardActions className='My-Listing-btn' >
                                            <div className='My-Listing-btn-all'>

                                                {/* <p className="forgot-password text-right">
                                                    Chat <a href="./BuyerSellerChat">Click Here</a>
                                                </p> */}
                                                <Button
                                                    size="medium"
                                                    color="primary"
                                                    onClick={() => handleEdit(listing)}
                                                    sx={{
                                                        backgroundColor: "#1976d2",
                                                        color: "#fff",
                                                        '&:hover': {
                                                            backgroundColor: "#115293",
                                                        },
                                                        padding: "6px 16px",
                                                        marginRight: "10px",
                                                        borderRadius: "8px"
                                                    }}
                                                    startIcon={<EditIcon />}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    size="medium"
                                                    color="secondary"
                                                    onClick={() => handleOpenDeleteDialog(listing)} // Open dialog on delete
                                                    sx={{
                                                        backgroundColor: "#d32f2f",
                                                        color: "#fff",
                                                        '&:hover': {
                                                            backgroundColor: "#9a0007",
                                                        },
                                                        padding: "6px 16px",
                                                        borderRadius: "8px"
                                                    }}
                                                    startIcon={<DeleteIcon />}
                                                >
                                                    Delete
                                                </Button>
                                            </div>

                                        </CardActions>

                                        {/* Confirmation Dialog */}
                                        <Dialog
                                            open={openDeleteDialog}
                                            onClose={handleCloseDeleteDialog}
                                            sx={{ '& .MuiDialogTitle-root': { fontWeight: 'bold', fontSize: '1.5rem' }, '& .MuiDialogContent-root': { fontSize: '1.2rem' } }} // Adjust title and content font size and weight
                                        >
                                            <DialogTitle>Confirm Deletion</DialogTitle>
                                            <DialogContent>
                                                <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: '500' }}>
                                                    Are you sure you want to delete this listing?
                                                </Typography>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleCloseDeleteDialog} color="primary" variant="outlined" sx={{ fontSize: '1rem', padding: '10px 20px', fontWeight: 'bold' }}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={confirmDelete} color="secondary" variant="contained" sx={{ fontSize: '1rem', padding: '10px 20px', fontWeight: 'bold' }}>
                                                    Confirm
                                                </Button>
                                            </DialogActions>
                                        </Dialog>

                                        {/* Snackbar for notifications */}
                                        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                                            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                                {snackbarMessage}
                                            </Alert>
                                        </Snackbar>

                                    </CardContent>


                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>No listings found.</Typography>
                )}
            </div>
            {selectedListing && (
                <Dialog open={Boolean(selectedListing)} onClose={handleClose}>
                    <DialogTitle style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {editMode ? 'Edit Listing' : 'Add Listing'}
                        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <div className='Edit-Property'>
                            <InputLabel id="property-for-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Property For</InputLabel>
                            <Select
                                labelId="property-for-label"
                                name="propertyFor"
                                value={listingData.propertyFor}
                                onChange={handleInputChange}
                                label="Property For"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected}</span>}
                            >
                                <MenuItem value="sell">Sell</MenuItem>
                                <MenuItem value="rent">Rent</MenuItem>
                                <MenuItem value="pg">PG</MenuItem>
                            </Select>

                            <InputLabel id="property-type-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Property Type</InputLabel>
                            <Select
                                labelId="property-type-label"
                                name="propertyType"
                                value={listingData.propertyType}
                                onChange={handleInputChange}
                                label="Property Type"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="flat">Flat/Apartment</MenuItem>
                                <MenuItem value="independentHouse">Independent House</MenuItem>
                                <MenuItem value="builderFloor">Builder Floor</MenuItem>
                                <MenuItem value="officeSpace">Office Space</MenuItem>
                                <MenuItem value="farmHouse">Farm House</MenuItem>
                                <MenuItem value="landPlot">Land/Plot</MenuItem>
                            </Select>

                            <InputLabel id="sale-type-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Sale Type</InputLabel>
                            <Select
                                labelId="sale-type-label"
                                name="saleType"
                                value={listingData.saleType}
                                onChange={handleInputChange}
                                label="Sale Type"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="new">New</MenuItem>
                                <MenuItem value="resale">Resale</MenuItem>
                            </Select>

                            <InputLabel id="number-of-floors-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Number of Floors</InputLabel>
                            <Select
                                labelId="number-of-floors-label"
                                name="numberOfFloors"
                                value={listingData.numberOfFloors}
                                onChange={handleInputChange}
                                label="Number of Floors"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                            </Select>

                            <InputLabel id="property-on-floor-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Property on Floor</InputLabel>
                            <Select
                                labelId="property-on-floor-label"
                                name="propertyOnFloor"
                                value={listingData.propertyOnFloor}
                                onChange={handleInputChange}
                                label="Property on Floor"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="ground">Ground Floor</MenuItem>
                                <MenuItem value="1st">1st Floor</MenuItem>
                                <MenuItem value="2nd">2nd Floor</MenuItem>
                            </Select>

                            <InputLabel id="number-of-bedrooms-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Number of Bedrooms</InputLabel>
                            <Select
                                labelId="number-of-bedrooms-label"
                                name="numberOfBedrooms"
                                value={listingData.numberOfBedrooms}
                                onChange={handleInputChange}
                                label="Number of Bedrooms"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="1">1 BHK</MenuItem>
                                <MenuItem value="2">2 BHK</MenuItem>
                                <MenuItem value="3">3 BHK</MenuItem>
                                <MenuItem value="4">4 BHK</MenuItem>
                                <MenuItem value="6">6 BHK</MenuItem>
                            </Select>

                            <InputLabel id="number-of-bathrooms-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Number of Bathrooms</InputLabel>
                            <Select
                                labelId="number-of-bathrooms-label"
                                name="numberOfBathrooms"
                                value={listingData.numberOfBathrooms}
                                onChange={handleInputChange}
                                label="Number of Bathrooms"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="1">1</MenuItem>
                                <MenuItem value="2">2</MenuItem>
                                <MenuItem value="3">3</MenuItem>
                                <MenuItem value="4">4</MenuItem>
                            </Select>

                            <InputLabel id="number-of-balconies-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>Number of Balconies</InputLabel>
                            <Select
                                labelId="number-of-balconies-label"
                                name="numberOfBalconies"
                                value={listingData.numberOfBalconies}
                                onChange={handleInputChange}
                                label="Number of Balconies"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select</em>}</span>}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="1">1</MenuItem>
                                <MenuItem value="2">2</MenuItem>
                            </Select>

                            <InputLabel id="state-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>State</InputLabel>
                            <Select
                                labelId="state-label"
                                name="state"
                                value={listingData.state}
                                onChange={handleInputChange}
                                label="State"
                                renderValue={(selected) => <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selected || <em>Select State</em>}</span>}
                            >
                                <MenuItem value=""><em>Select State</em></MenuItem>
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



                            <TextField
                                label="City"
                                name="city"
                                value={listingData.city}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                style={{ fontSize: '16px', fontWeight: 'bold' }} // For the input text
                                InputLabelProps={{
                                    style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                                }}
                                InputProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                                }}
                            />

                            <TextField
                                label="Mobile No"
                                name="mobileNo"
                                value={listingData.mobileNo || ''}  // Ensure it's never undefined or null
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                style={{ fontSize: '16px', fontWeight: 'bold' }} // For the input container
                                InputLabelProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }, // Increase label size and make it bold
                                }}
                                InputProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                                }}
                            />


                            <TextField
                                label="Address"
                                name="address"
                                value={listingData.address}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                style={{ fontSize: '16px', fontWeight: 'bold' }}
                                InputLabelProps={{
                                    style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                                }}
                                InputProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                                }}
                            />

                            <TextField
                                label="Ownership"
                                name="ownership"
                                value={listingData.ownership}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                style={{ fontSize: '16px', fontWeight: 'bold' }}
                                InputLabelProps={{
                                    style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                                }}
                                InputProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                                }}
                            />

                            <TextField
                                label="Carpet Area (sq ft)"
                                name="carpetArea"
                                value={listingData.carpetArea}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                type="number"
                                style={{ fontSize: '16px', fontWeight: 'bold' }}
                                InputLabelProps={{
                                    style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                                }}
                                InputProps={{
                                    inputProps: {
                                        min: 100,
                                        max: 5000,
                                        style: { fontSize: '16px', fontWeight: 'bold' }
                                    },
                                }}
                                placeholder="Enter carpet area (100 - 5000 sq ft)"
                                variant="outlined"
                                helperText="Please enter a value between 100 and 5000."
                            />

                            <TextField
                                label="Plot Area"
                                name="plotArea"
                                value={listingData.plotArea}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                style={{ fontSize: '16px', fontWeight: 'bold' }}
                                InputLabelProps={{
                                    style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                                }}
                                InputProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                                }}
                            />

                            <TextField
                                label="Booking Amount"
                                name="bookingAmount"
                                value={listingData.bookingAmount}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                style={{ fontSize: '16px', fontWeight: 'bold' }}
                                InputLabelProps={{
                                    style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                                }}
                                InputProps={{
                                    style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                                }}
                            />

                        </div>


                        <TextField
                            label="Description"
                            name="description"
                            value={listingData.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={10}
                            margin="normal"
                            style={{ fontSize: '16px', fontWeight: 'bold' }}
                            inputProps={{
                                maxLength: 2000,
                            }}
                            placeholder="Tell us more about the property..."
                            variant="outlined"
                            InputLabelProps={{
                                style: { fontSize: '18px', fontWeight: 'bold' }, // Label size and bold
                            }}
                            InputProps={{
                                style: { fontSize: '16px', fontWeight: 'bold' }  // Increase input text size and make it bold
                            }}
                        />


                        <input
                            type="file"
                            accept="image/*, video/*"
                            multiple
                            style={{ display: 'none' }}
                            id="media-upload"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="media-upload">
                            <Button
                                variant="contained"
                                component="span"
                                color="primary"
                                style={{ fontSize: '16px', fontWeight: 'bold' }}
                            >
                                Choose Files
                            </Button>
                        </label>
                        <InputLabel>Upload Media</InputLabel>

                        <div className=''>
                            <Grid container spacing={2}>
                                {previews.map((preview, index) => (
                                    <Grid
                                        item
                                        xs={12} // Full width for small screens
                                        sm={6} // Half width (two per row) for larger screens
                                        key={index}
                                        style={{ position: 'relative' }}
                                    >
                                        {/* Display loading spinner if uploading and it's the current index */}
                                        {isUploading && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 2,
                                            }}>
                                                <CircularProgress />
                                            </div>
                                        )}

                                        {/* Determine if the preview is an image or video based on the URL */}
                                        {preview.includes('.mp4') ? (
                                            <CardMedia
                                                component="video"
                                                src={preview}
                                                sx={{
                                                    width: '100%',   // Full width within the grid item
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                }}
                                                controls
                                                alt={`Preview ${index}`}
                                            />
                                        ) : (
                                            <img
                                                src={preview}
                                                alt={`Preview ${index}`}
                                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                            />
                                        )}

                                        <IconButton
                                            onClick={() => handleRemoveMedia(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                color: 'white',
                                                backgroundColor: 'red',
                                                zIndex: 1,
                                            }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>

                        </div>
                    </DialogContent>

                    <DialogActions sx={{ paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            onClick={handleClose}
                            size="medium"
                            color="secondary"
                            sx={{
                                backgroundColor: "#d32f2f",   // Secondary button color
                                color: "#fff",                // Text color
                                '&:hover': {
                                    backgroundColor: "#9a0007", // Darker shade on hover
                                },
                                padding: "6px 16px",          // Button padding
                                borderRadius: "8px",          // Rounded corners
                                marginRight: "10px"           // Space between buttons
                            }}
                        >
                            Cancel
                        </Button>
                        {editMode && (
                            <Button
                                onClick={handleSave}
                                size="medium"
                                color="primary"
                                sx={{
                                    backgroundColor: "#1976d2",  // Primary button color
                                    color: "#fff",               // Text color
                                    '&:hover': {
                                        backgroundColor: "#115293",  // Darker shade on hover
                                    },
                                    padding: "6px 16px",         // Button padding
                                    borderRadius: "8px"          // Rounded corners
                                }}
                            >
                                Save
                            </Button>
                        )}
                    </DialogActions>

                </Dialog>
            )}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <footer style={{
                width: '100%',
                bottom: '0',
                backgroundColor: '#151C22',
                position: "absolute"
            }}>

                <div className="footer-detail">

                    <div className="footer-trademark"> All rights
                        reserved to respective Owners - © Real-Estate (India) Ltd.</div>

                    <div className="footer-info">

                        <p className="Cnt"> <strong> ☎ Contact Us: </strong> 1800 41 99099</p>
                        <p className="toll-time"> 📅 9:30 AM to 6:30 PM (Mon-Sun)</p>
                        <p className="email-id"><strong>✉ Email: </strong> feedback@real-estate.com</p>

                    </div>


                </div>




            </footer>

        </div >
    );
};

export default MyListings;
