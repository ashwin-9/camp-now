const express = require('express');
const passport = require('passport');

const router = express.Router({ mergeParams: true });

//Import from Controllers
const users = require('../controllers/users');

//Error Middleware
const catchAsync = require('../utils/catchAsync');

//Routes
router.route('/register')
    .get(users.renderRegisterForm) //Form to register
    .post(catchAsync(users.registerUser)) //Submit route for Register Form

router.route('/login')
    .get(users.renderLoginForm) //Form to login
    .post(passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }), catchAsync(users.loginUser)); //Submit route for Login Form

//Logout Route
router.get('/logout', users.logoutUser)

module.exports = router;