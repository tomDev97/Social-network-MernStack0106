const express = require('express');
const bcrypt = require('bcrypt');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const router = express.Router();

mongoose.set('useFindAndModify', false);

/**LOAD MODEL */
const { User } = require('../models/users');
const { Post } = require('../models/posts');
const { Comment } = require('../models/comments');

/**
 * ROUTE : /user/register
 * METHOD : GET
 * DES : GET THE REGISTER PAGE
 */
router.get('/register', (req, res) => {
    res.render('user/register');
});

/**
 * ROUTE : /user/register
 * METHOD : POST
 * DES : POST AND SAVE INFO IN DATABASE
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email } = req.body;

        let userFinded = await User.findOne({ username: username });
        if (userFinded) res.json({ error: true, message: 'username_exits' });

        let passHass = await bcrypt.hash(password, 10);
        if (!passHass) res.json({ error: true, messahe: 'hashing_pass_error' });

        const newUser = new User({
            username, password: passHass, name, email
        })
        newUser.save();
        res.redirect('/user/login');

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

/**
 * ROUTE : /user/login
 * METHOD :GET
 * DES : GET FOR LOGIN
 */
router.get('/login', (req, res) => {
    res.render('user/login');
});



/**
 * ROUTE : /user/login
 * METHOD :POST
 * DES : POST INFO USER LOGIN AND QUERY WITH DATABASE
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        //find info user
        let userFinded = await User.findOne({ username });
        if (!userFinded) res.json({ error: true, message: 'user_not_exits' });

        let isExitsPass = await bcrypt.compare(password, userFinded.password);
        if (!isExitsPass) res.json({ error: true, message: 'pass_wrong' });

        //session
        req.session.username = userFinded.username;
        if (!req.session.username) res.json({ error: true, message: 'cant_add_session' });

        /**
         * jwt
         */
        res.redirect('/user/profile');
    } catch (error) {
        res.json({ error: true, message: error.message });
    }

});

/**
 * ROUTE : /user/profile
 * METHOD :GET
 * DES : GET INFO USER 
 */
router.get('/profile', async (req, res) => {
    try {
        const { username } = req.session;
        if (!username) res.redirect('/user/login');

        //get all info user
        let userFinded = await User.findOne({ username })
            .populate({
                path: 'friends',
                select: 'name email'
            })
            .populate({
                path: 'guestRequest',
                select: 'username name email'
            })
        if (!userFinded) res.json({ error: true, message: 'user_not_found' });

        //get list post       
        let listPostAndAuthor = await Post.find({})
            .populate({
                path: 'authorId',
                select: 'name'
            })
            .populate({
                path: 'likes',
                select: 'name'
            })

        //get list comment 
        let listPostComment = await Comment.find({})
            .populate({
                path: 'userId',
                select: 'name'
            })



        //get list user 
        let listAllUser = await User.find({ username: { $ne: userFinded.username } });

        res.render('user/profile', { userFinded, listAllUser, listPostAndAuthor, listPostComment });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
})


/**
 * ROUTE : user/add-friend/:_id
 * METHOD :GET
 * DES : GET INFO USER 
 */
router.get('/add-friend/:guestRequestId', async (req, res) => {
    try {
        let { guestRequestId } = req.params;
        let { username } = req.session;
        if (!ObjectId.isValid(guestRequestId)) res.json({ error: true, message: 'id_isvalid' });

        // add id receiver into friends request of sender
        let infoSenderAfterUpdate = await User.findOneAndUpdate({ username }, {
            $addToSet: { friendRequest: guestRequestId }
        }, { new: true });

        //add id sender into guest request of receiver
        let infoReceiverAfterUpdate = await User.findByIdAndUpdate(guestRequestId, {
            $addToSet: { guestRequest: infoSenderAfterUpdate._id }
        }, { new: true });

        if (!infoSenderAfterUpdate || !infoReceiverAfterUpdate) res.json({ error: true, message: 'error_when_add_friend' });
        res.redirect('/user/profile');

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});


/**
 * ROUTE : user/remove-friend/:_id
 * METHOD :GET
 * DES : GET INFO USER 
 */
router.get('/undo-friend/:guestRequestId', async (req, res) => {
    try {
        let { guestRequestId } = req.params;
        let { username } = req.session;
        if (!ObjectId.isValid(guestRequestId)) res.json({ error: true, message: 'id_isvalid' });

        // add id receiver into friends request of sender
        let infoSenderAfterUpdate = await User.findOneAndUpdate({ username }, {
            $pull: { friendRequest: guestRequestId }
        }, { new: true });

        //add id sender into guest request of receiver
        let infoReceiverAfterUpdate = await User.findByIdAndUpdate(guestRequestId, {
            $pull: { guestRequest: infoSenderAfterUpdate._id }
        }, { new: true });

        if (!infoSenderAfterUpdate || !infoReceiverAfterUpdate) res.json({ error: true, message: 'error_when_add_friend' });
        res.redirect('/user/profile');

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

/**
 * ROUTE : user/comfirm-friend/:_id
 * METHOD :GET
 * DES : comfirm-friend
 */
router.get('/comfirm-friend/:guestRequestId', async (req, res) => {
    try {
        let { guestRequestId } = req.params; //ngta
        let { username } = req.session; // mình 
        if (!ObjectId.isValid(guestRequestId)) res.json({ error: true, message: 'id_isvalid' });
        //-------------
        //User Chập nhận kết bạn
        let infoUserComfirmed = await User.findOneAndUpdate({ username }, {
            $pull: { guestRequest: guestRequestId },
            $addToSet: { friends: guestRequestId }
        }, { new: true });

        //User đc đồng ý
        let infoUserSender = await User.findByIdAndUpdate(guestRequestId, {
            $pull: { friendRequest: infoUserComfirmed._id },
            $addToSet: { friends: infoUserComfirmed._id }
        }, { new: true });

        if (!infoUserComfirmed || !infoUserSender) res.json({ error: true, message: 'error_when_comfirm_friend' });
        res.redirect('/user/profile');
        //------------
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

/**
 * ROUTE : user/remove-request-friend/:_id
 * METHOD :GET
 * DES : remove request add friends of guest request
 */
router.get('/remove-request-friend/:guestRequestId', async (req, res) => {
    try {
        let { guestRequestId } = req.params; // User guest 
        let { username } = req.session; // mình User login
        if (!ObjectId.isValid(guestRequestId)) res.json({ error: true, message: 'id_isvalid' });
        //-------------
        //User xóa id người kết bạn từ Guest Request
        let infoUserComfirmed = await User.findOneAndUpdate({ username }, {
            $pull: { guestRequest: guestRequestId }
        }, { new: true });

        // User Guest xóa id trong Friends Request
        let infoUserSender = await User.findByIdAndUpdate(guestRequestId, {

        }, { new: true });

        if (!infoUserComfirmed || !infoUserSender) res.json({ error: true, message: 'error_when_comfirm_friend' });
        res.redirect('/user/profile');
        //------------
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});


/**
* ROUTE : user/remove-friend/:_id
* METHOD :GET
* DES : remove friends out array Friends of 2 User
 */
router.get('/remove-friend/:friendId', async (req, res) => {
    try {
        let { friendId } = req.params;
        let { username } = req.session;
        if (!ObjectId.isValid(friendId)) res.json({ error: true, message: 'id_isvalid' });

        // fidn user remove and remove id 
        let infoUserPerformRemovedAfterUpdate = await User.findOneAndUpdate({ username }, {
            $pull: { friends: friendId }
        }, { new: true });

        // fidn user bị remove and remove id 
        let infoUserBeRemovedAfterUpdate = await User.findByIdAndUpdate(friendId, {
            $pull: { friends: infoUserPerformRemovedAfterUpdate._id }
        }, { new: true });

        if (!infoUserPerformRemovedAfterUpdate || !infoUserBeRemovedAfterUpdate) res.json({ error: true, message: 'error_when_remove_friend' });
        res.redirect('/user/profile');


    } catch (error) {
        res.json({ error: true, message: error.message });
    }
})



// //ROUTE ADD && UNDO =======> TOMDEV
// router.get('/add-friend/:guestRequestId', async (req, res) => {
//     try {

//         //get session && id receiver
//         let { guestRequestId } = req.params;
//         let { username } = req.session;
//         if (!ObjectId.isValid(guestRequestId)) res.json({ error: true, message: 'id_isvalid' });

//         // find user sender
//         let userSender = await User.findOne({ username });
//         if (!userSender) res.json({ error: true, message: 'user_not_exits' });

//         // check id receiver exits into array userSender.friendRequest
//         let isExitsfriendRequest = await userSender.friendRequest.includes(guestRequestId); //return true => isExits  --  false => is not Exits
//         if (isExitsfriendRequest) {
//                     // add id receiver into friends request of sender
//             let infoSenderAfterUpdate = await User.findOneAndUpdate({ username }, {
//                 $pull: { friendRequest: guestRequestId }
//             }, { new: true });

//             //add id sender into guest request of receiver
//             let infoReceiverAfterUpdate = await User.findByIdAndUpdate(guestRequestId, {
//                 $pull: { guestRequest: infoSenderAfterUpdate._id }
//             }, { new: true });
//             if (!infoSenderAfterUpdate || !infoReceiverAfterUpdate) res.json({ error: true, message: 'error_when_add_friend' });
//             res.json({ infoSenderAfterUpdate, infoReceiverAfterUpdate });
//             // res.redirect('/user/profile');
//         }

//         // add id receiver into friends request of sender
//         let infoSenderAfterUpdate = await User.findOneAndUpdate({ username }, {
//             $addToSet: { friendRequest: guestRequestId }
//         }, { new: true });

//         //add id sender into guest request of receiver
//         let infoReceiverAfterUpdate = await User.findByIdAndUpdate(guestRequestId, {
//             $addToSet: { guestRequest: infoSenderAfterUpdate._id }
//         }, { new: true });
//         if (!infoSenderAfterUpdate || !infoReceiverAfterUpdate) res.js on({ error: true, message: 'error_when_add_friend' });

//         res.redirect('/user/profile');
//     } catch (error) {
//         res.json({ error: true, message: error.message });
//     }
// });





module.exports = router;