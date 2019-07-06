const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    content: { type: String, required: String }
})
const Comment = mongoose.model('comment', CommentSchema);

module.exports = {
    Comment, CommentSchema
}