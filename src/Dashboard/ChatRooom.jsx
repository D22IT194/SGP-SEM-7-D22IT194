import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Avatar } from '@mui/material';
import { ref, push, onValue, serverTimestamp, get } from 'firebase/database';
import { useAuth } from './AuthContext';
import { getDatabase } from 'firebase/database';
import { format } from 'date-fns';


function ChatRoom({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const db = getDatabase();

  // Fetch user details from the database using senderId
  const fetchUserDetails = async (senderId) => {
    const userRef = ref(db, `users/${senderId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  };

  // Fetch messages for the chat in real-time
  useEffect(() => {
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data ? Object.values(data) : [];

      const messagesWithUserDetails = await Promise.all(
        loadedMessages.map(async (msg) => {
          const senderInfo = await fetchUserDetails(msg.senderId);
          return {
            ...msg,
            senderProfileName: senderInfo ? senderInfo.displayName : msg.senderRole,
            senderProfilePic: senderInfo ? senderInfo.profilePic : null, // assuming profilePic is stored
          };
        })
      );

      setMessages(messagesWithUserDetails);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, db]);

  // Scroll to the latest message
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
  
    try {
      const chatRef = ref(db, `chats/${chatId}/messages`);
      await push(chatRef, {
        senderId: user.uid,
        senderRole: user.displayName,
        message: newMessage,
        timestamp: serverTimestamp(),
      });
  
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      // Optionally, show an error message to the user
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh', maxWidth: 600, margin: 'auto', border: 1, borderRadius: 2, p: 2, boxShadow: 3, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" align="center" sx={{ mb: 2, color: 'primary.main' }}>Chat Room</Typography>

      <Box id="chat-container" sx={{ flex: 1, overflowY: 'auto', mb: 2, p: 2, backgroundColor: '#ffffff', borderRadius: 1, boxShadow: 1 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: msg.senderId === user.uid ? 'row-reverse' : 'row', mb: 2 }}>
              <Avatar src={msg.senderProfilePic} sx={{ width: 40, height: 40, mx: 1 }} /> {/* Sender's profile picture */}
              <Paper
                sx={{
                  maxWidth: '75%',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: msg.senderId === user.uid ? 'primary.main' : 'grey.200',
                  color: msg.senderId === user.uid ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {msg.senderProfileName || (msg.senderRole === 'buyer' ? 'Buyer' : 'Seller')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{msg.message}</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                  {format(new Date(msg.timestamp), 'hh:mm a')}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            borderRadius: 2,
            backgroundColor: 'white',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderRadius: '20px',
              },
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
          sx={{
            borderRadius: '50%',
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default ChatRoom;
