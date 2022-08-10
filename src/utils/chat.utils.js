const Chat = require('./../models/chat.model');
const User = require('./../models/user.model');
const { socketController } = require('./../socket/socket.controller');
const { v4 } = require('uuid');

// Basic DB operations
const createChat = async (req, res) => {
    try {
        let {members, is_group, group_name} = req.body;

        // Verify if the direct message chat already exists
        if (!is_group) {
            const chat_dm = await Chat.findOne({members}, {_id: 0, __v: 0});

            if (chat_dm) return res.json(chat_dm);
        }


        // Create unique public id
        const public_id = v4();

        // If the chat is not a group can't have a group name
        if (members.length > 2) {
            is_group = true;
        } else {
            is_group = false;
            group_name = '';
        }

        const chat = new Chat({
            public_id,
            members,
            is_group,
            group_name
        });

        // Add the public id of the chat to the each user in the array chats
        for (member of members) {
            await User.findOneAndUpdate({username: member}, {$push: {chats: chat.public_id}});
        }

        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const updateChat = async (req, res) => {
    try {
        let {members, is_group, group_name} = req.body;

        // Find chat and update it
        const chat = await Chat.findByIdAndUpdate(req.params.id, {
            members,
            is_group,
            group_name
        }, {new: true});

        res.json(chat);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const deleteChat = async (req, res) => {
    try {
        // Find chat and delete it
        const chat = await Chat.findByIdAndDelete(req.params.id);

        // If the chat doesn't exist
        if (!chat) return res.status(400).json({message: "Chat doesn't exist."});

        res.json(chat);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Requirements functions
const getChats = async (req, res) => {
    try {
        let username = req.username;

        // Find public_ids of the user
        const user = await User.findById(req.user_id, {chats: 1});

        var chats = [];
        // Search chat for each public id in the user's chats
        for (const public_id of user.chats) {
            const chat = await Chat.findOne({public_id: public_id}, {_id: 0, chat_history: 0, createdAt: 0, updatedAt: 0});

            // Check if the user is in the chat
            if (chat && chat.members.includes(username)) {
                chats.push(chat);
            }
        }

        res.json(chats);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
};

const getChat = async (req, res) => {
    try {
        // Find the chat
        const chat = await Chat.findOne({public_id: req.params.public_id}, {_id: 0});

        // If the chat doesn't exist.
        if (!chat) return res.status(404).json({message: "Chat doesn't exist."});

        // If the user isn't in the chat
        if (!chat.members.includes(req.username)) return res.status(500).json({message: 'Chat not found.'});

        res.json(chat);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const leaveChat = async (req, res) => {
    try {
        // Find the chat
        const chat = await Chat.findOne({public_id: req.params.public_id});

        // If the chat isn't found
        if (!chat) return res.status(404).json({message: "Chat doesn't exist."});

        // If the user isn't in the chat
        if (!chat.members.includes(req.username)) return res.status(500).json({message: 'Chat not found.'});

        // Find user and delete the public id in the chats array
        const user = await User.findByIdAndUpdate(req.user_id, {$pull: {
            chats: req.params.public_id
        }}, {new: true});

        // Delete user in the chat members array
        await Chat.findOneAndUpdate({public_id: req.params.public_id}, {$pull: {
            members: user.username
        }});

        res.json(user);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const addMember = async (req, res) => {
    try {
        // Find chat
        var chat = await Chat.findOne({public_id: req.params.public_id});

        // If the chat isn't found
        if (!chat || !chat.members.includes(req.username)) return res.status(404).json({message: "Chat not found."});

        // We need the admin conditional

        // Find user
        var user = await User.findOne({username: req.params.username}, {username: 1, chats: 1});

        // If the user doesn't exist
        if (!user) return res.status(404).json({message: "User doesn't exist."});

        // If the user is already in the chat
        if (user.chats.includes(chat.public_id)) return res.status(500).json({message: `The user ${user.username} is already in the chat.`});

        // Add the public id in the users chats array
        user = await User.findOneAndUpdate({username: req.params.username}, {$push: {
            chats: chat.public_id
        }}, {new: true});

        let is_group = chat.is_group;
        let group_name = chat.group_name;
        // Check if the chat will be a group
        if (chat.members.length == 2) {
            // Modify the attributes
            is_group = true;
            group_name = 'Group'
        }

        // Add the username to members array in chat
        chat = await Chat.findOneAndUpdate({public_id: req.params.public_id}, {
            is_group,
            group_name,
            $push: {
                members: user.username
            }
        }, {new: true});

        res.json(chat);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const kickMember = async (req, res) => {
    try {
        // Find the chat
        var chat = await Chat.findOne({public_id: req.params.public_id});

        // If the chat isn't found
        if (!chat || !chat.members.includes(req.username)) return res.status(404).json({message: "Chat not found."});

        // We need the admin conditional

        // Find user
        var user = await User.findOne({username: req.params.username}, {username: 1, chats: 1});

        // If the user doesn't exist
        if (!user) return res.status(404).json({message: "User doesn't exist."});

        // If the user isn't in the chat
        if (!user.chats.includes(chat.public_id)) return res.status(500).json({message: `The user ${user.username} isn't in the chat.`});

        // Remove the public id in the users chats array
        user = await User.findOneAndUpdate({username: req.params.username}, {$pull: {
            chats: chat.public_id
        }}, {new: true});

        let is_group = chat.is_group;
        let group_name = chat.group_name;

        // Check if the chat will not be a group
        if (chat.members.length == 3) {
            // Modify the attributes
            is_group = false;
            group_name = ''
        }

        // Remove the username to members array in chat
        chat = await Chat.findOneAndUpdate({public_id: req.params.public_id}, {
            is_group,
            group_name,
            $pull: {
                members: user.username
            }
        }, {new: true});

        res.json(chat);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const test = async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    createChat,
    updateChat,
    deleteChat,
    getChats,
    getChat,
    leaveChat,
    addMember,
    test,
    kickMember
};