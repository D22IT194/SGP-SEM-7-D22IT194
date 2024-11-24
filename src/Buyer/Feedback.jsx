import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Rating } from '@mui/material';

const Feedback = () => {
    // State variables to store form input
    const [name, setName] = useState('');
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you can integrate your database call or API to save feedback
        console.log({
            name,
            review,
            rating,
            date: new Date().toLocaleString(), // Store current date and time
        });
        setSubmitted(true);
    };

    return (
        <Box
            component="form"
            sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2 
            }}
            onSubmit={handleSubmit}
        >
            <Typography variant="h5" gutterBottom>
                Leave Your Feedback
            </Typography>

            <TextField
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <Typography component="legend">Rating</Typography>
            <Rating
                name="simple-controlled"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                required
            />

            <TextField
                label="Review"
                variant="outlined"
                multiline
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
            />

            <Button type="submit" variant="contained" color="primary">
                Submit
            </Button>

            {submitted && (
                <Typography variant="body1" color="green">
                    Thank you for your feedback!
                </Typography>
            )}
        </Box>
    );
};

export default Feedback;
