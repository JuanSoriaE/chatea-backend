const jwt = require('jsonwebtoken');
const User = require('./../models/user.model');
const Chat = require('./../models/chat.model');

async function verifyToken(token) {
    try {
        // Check if the user has a token
        if (!token || token.length < 10) return null;

        // Decode token
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

        return await User.findById(decoded.id);
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function handleJoinReq(socket, public_ids, username) {
    socket.leaveAll();
    
    for (let public_id of public_ids) {
        // Verify if user is in chat
        let chat = await Chat.findOne({public_id}, {members: 1});
        if (chat.members.includes(username)) socket.join(public_id);
    }
}

async function handleNewMessage(socket, data) {
    const { members } = await Chat.findOne({public_id: data.public_id}, {members: 1});

    // Verify if the user is in the members
    if (!members.includes(data.message_data.from)) return;

    // Send message
    socket.to(data.public_id).emit('new message', data);

    // Save message
    const chat_data = {
        message: data.message_data.message,
        from: data.message_data.from
    };

    await Chat.findOneAndUpdate({public_id: data.public_id}, {'$push': {
        'chat_history': chat_data
    }});
}

function handleChatChange(socket, data) {
    console.log(data);
    
    // Send chat change
    socket.to(data.public_id).emit('chat change', data);
}

async function socketController(socket, io) {
    const user = await verifyToken(socket.handshake.headers['access-token']);
    if (!user) return socket.disconnect();

    console.log('New connection');

    socket.on('join req', public_ids => handleJoinReq(socket, public_ids, user.username));

    socket.on('new message', data => handleNewMessage(socket, data));

    socket.on('chat change', data => handleChatChange(socket, data));
}

module.exports = {
    socketController
}