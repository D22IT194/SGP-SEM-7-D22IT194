import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, CircularProgress, CardMedia, Grid, Snackbar } from "@mui/material";
import BuyerHeader from "./BuyerHeader";
import Footer from "../Dashboard/Footer";

const MyFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const db = getFirestore();
        const favoritesRef = collection(db, "favorites");
        
        if (user) {
            const q = query(favoritesRef, where("userId", "==", user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const favoritesList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setFavorites(favoritesList);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching favorites:", error);
                setError("Failed to load favorites.");
                setLoading(false);
            });

            return () => unsubscribe(); // Clean up Firestore subscription on unmount
        } else {
            setLoading(false); // Set loading to false if no user is authenticated
        }
    }, [user]);

    const handleRemoveFavorite = async (propertyId) => {
        const db = getFirestore();
        const favoriteRef = doc(db, "favorites", propertyId);

        try {
            await deleteDoc(favoriteRef);
            setSnackbarMessage("Favorite property removed successfully!");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error removing favorite property:", error);
            setSnackbarMessage("Failed to remove favorite property.");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div>
            <BuyerHeader />
            <h2>My Favorites</h2>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : favorites.length > 0 ? (
                <Grid container spacing={2}>
                    {favorites.map((favorite) => (
                        <Grid item xs={12} sm={6} md={4} key={favorite.id}>
                            <Card style={{ marginBottom: "16px" }}>
                                {favorite.mediaURLs && favorite.mediaURLs[0] ? (
                                    <CardMedia
                                        component={favorite.mediaURLs[0].includes(".mp4") ? "video" : "img"}
                                        height="250"
                                        image={favorite.mediaURLs[0]}
                                        alt="Property Media"
                                        controls={favorite.mediaURLs[0].includes('.mp4')}
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
                                    <Typography variant="h5">{favorite.propertyType}</Typography>
                                    <Typography>{favorite.city}, {favorite.state}</Typography>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleRemoveFavorite(favorite.id)}
                                    >
                                        Remove from Favorites
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No favorite properties found.</Typography>
            )}
            <Snackbar
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                autoHideDuration={3000}
            />
            <Footer />
        </div>
    );
};

export default MyFavorites;
