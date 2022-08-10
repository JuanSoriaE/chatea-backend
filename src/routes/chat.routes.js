const router = require('express').Router();
const {createChat, updateChat, deleteChat, getChats, getChat, leaveChat, addMember, test, kickMember} = require('./../utils/chat.utils');
const {verifyToken} = require('./../controllers/auth.controller');

// Basic DB operations
router.post('/chat', verifyToken, createChat);

router.put('/chat/:id', verifyToken, updateChat);

router.delete('/chat/:id', verifyToken, deleteChat);

// Requirements functions
router.get('/chats', verifyToken, getChats);

router.get('/chat/:public_id', verifyToken, getChat);

router.post('/leaveChat/:public_id', verifyToken, leaveChat);

router.post('/addMember/:public_id/:username', verifyToken, addMember);

router.post('/kickMember/:public_id/:username', verifyToken, kickMember);

// Testing
router.post('/test', verifyToken, test);

module.exports = router;