const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    public_id: {
        type: String,
        required: true,
        unique: true
    },
    members: [{
        type: String,
        required: true
    }],
    is_group: {
        type: Boolean,
        required: true,
        default: false
    },
    group_name: {
        type: String
    },
    chat_history: [{
        type: Object
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);