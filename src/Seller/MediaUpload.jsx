import React from 'react';
import { Button, InputLabel, IconButton, Grid, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MediaUpload = ({ previews, handleFileChange, handleRemoveMedia }) => {
    return (
        <Box sx={{ margin: '20px 0' }}>
            <InputLabel>Upload Media</InputLabel>
            <input
                type="file"
                accept="image/*, video/*"
                multiple
                style={{ display: 'none' }}
                id="media-upload"
                onChange={handleFileChange}
            />
            <label htmlFor="media-upload">
                <Button variant="contained" component="span" color="primary" sx={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                    Choose Files
                </Button>
            </label>
            <Grid container spacing={2}>
                {previews.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index} style={{ position: 'relative' }}>
                        {preview.endsWith('.mp4') || preview.endsWith('.webm') ? ( // Check if the preview is a video
                            <video
                                src={preview}
                                controls
                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        ) : (
                            <img
                                src={preview}
                                alt={`Preview ${index}`}
                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        )}

                        
                        <IconButton
                            onClick={() => handleRemoveMedia(index)}
                            style={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'red' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default MediaUpload;
