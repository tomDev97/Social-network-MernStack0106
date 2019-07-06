const express = require('express');
const router = express.Router();
const { User } = require('../models/users');
const { Post } = require('../models/posts');
const { Comment } = require('../models/comments');


router.get('/', (req, res) => {
    res.json({ post: 'haha' })
})

/**
 * ROUTE : /post/create
 * MEHOD : POST
 * des : CREATE A NEW POST WITH USER LOGIN
 */
router.post('/create', async (req, res) => {
    try {
        const { username } = req.session;
        const { title, content } = req.body;
        if (!username) res.redirect('/user/login');

        //find user create new post
        let infoUserLogin = await User.findOne({ username });
        let infoUserCreateId = infoUserLogin._id;

        //create a new post
        let newPost = new Post(
            {
                authorId: infoUserCreateId,
                title,
                content
            }
        )

        //save into db
        let postCreated = await newPost.save();
        res.redirect('/user/profile');

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
})

/**
 * ROUTE : /post/like/:likerId
 * MEHOD : GET
 * des : push id liker into likes of Post model
 */
router.get('/like/:postId', async (req, res) => {
    try {
        let { postId } = req.params;
        let { username } = req.session;
        if (!username) res.redirect('/user/login');

        //let find user login
        let userLiker = await User.findOne({ username });

        // get info user created this post and add id liker into array likes.
        let infoPostUpdatedBeLiked = await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: userLiker._id }
        }, { new: true });


        // res.json({ userLiker, infoPostUpdatedBeLiked });

        res.redirect('/user/profile');


    } catch (error) {
        res.json({ error: true, message: error.message });
    }


});
/** ROUTE : /post/post-comment/:postId
* MEHOD : GET
* des : push  comment into comments 
*/
router.post('/post-comment/:postId', async (req, res) => {
    try {
        let { postId } = req.params;
        let { content } = req.body;
        let { username } = req.session;
        if (!username) res.redirect('/user/login');

        //let find user login post comment
        let userLiker = await User.findOne({ username });

        let newComment = new Comment({
            userId: userLiker._id,
            postId,
            content
        })

        let saveComment = await newComment.save();


        res.json({ saveComment });

        // res.redirect('/user/profile');


    } catch (error) {
        res.json({ error: true, message: error.message });
    }


});





/**
 * ROUTE : /post/show-comment/:likerId
 * MEHOD : GET
 * des : push id liker into likes of Post model
 */

// router.get('/show-comment/:postId', async (req, res) => {
//     try {
//         let { postId } = req.params;
//         let { username } = req.session;
//         if (!username) res.redirect('/user/login');

//         // get info user created this post and add id liker into array likes.
//         let getAllCommentThisPost = await Comment.find({ 'postId': postId })
//             .populate({
//                 path: 'userId',
//                 select: 'name'
//             })
//         if(!getAllCommentThisPost) res.json({ error: true, message : 'error_find_comment'});


//         res.redirect('/user/profile');

//     } catch (error) {
//         res.json({ error: true, message: error.message });
//     }


// });









module.exports = router;
