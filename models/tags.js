const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    content: { type: String, required: String }
})
const Tag = mongoose.model('tag', TagSchema);

module.exports = {
    Tag, CommentSchema
}