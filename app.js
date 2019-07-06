const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

/**
 * INIT APP
 */
const PORT = 3000;
const app = express();
//user public
app.use(express.static(__dirname + '/public'));
mongoose.set('useFindAndModify', false);


/**Require router */
const RouteUser = require('./routers/user.route');
const RoutePost = require('./routers/post.route');





/****************************SETTING THIRTY MIDDLEWARE******************************* */

/**
 *MIDDLEWARE BODY-PARSER
 */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


/**
 *MIDDLEWARE EXPRESS-SESSION
 */
app.use(session({
    secret: 'tomdev97',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge : 10000000000000000000000000000000000000 }
}))






/**********************************SET VIEW ENGINE********************************* */
app.set('views', './views');
app.set('view engine', 'ejs');





/************************************Use Router********************************* */
app.use('/user', RouteUser);
app.use('/post', RoutePost);





/***************************************************************************** */
app.get('/', (req, res) => {
    res.render('home');
});




mongoose.connect('mongodb://localhost/project-mern-stack-0106', { useNewUrlParser: true })
    .then(() => {
        console.log(`Connected to MongoDb`);
        app.listen(PORT, () => console.log(`Start Port : ${PORT}`));
    })
    .catch(console.log)




