const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    amountView: { type: String, default: 0 },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default : 0
        }
    ],
    status : { type : Number, default : 1 } // 1 public, 0 : only Friends, -1 : private
})

const Post = mongoose.model('post', PostSchema)

module.exports = {
    PostSchema, Post
}