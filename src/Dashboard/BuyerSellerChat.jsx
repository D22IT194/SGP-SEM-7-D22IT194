// src/components/BuyerSellerChat.js
import React from 'react';
import ChatRoom from './ChatRooom';

function BuyerSellerChat({ buyerId, sellerId }) {
    const chatId = `${buyerId}_${sellerId}`; // Unique chat ID based on buyer and seller

    return (
        <div>
            <ChatRoom chatId={chatId} />
        </div>
    );
}

export default BuyerSellerChat;
