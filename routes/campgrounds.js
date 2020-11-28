const { storage } = require('../cloudinary');
const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage });

//Import from Controllers
const campgrounds = require('../controllers/campgrounds');

//Error Middleware
const catchAsync = require('../utils/catchAsync');

//Middleware
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

//Routes
router.route('/')
    .get(catchAsync(campgrounds.index)) //Index Route
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //Submit Route For New Campground Form

router.get('/new', isLoggedIn, campgrounds.renderNewForm); //Form For New Campground

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) //Show Route For Campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //Submit Route For Edit Campground Form
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) //Delete Route for Campground

//Form For Edit Campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;