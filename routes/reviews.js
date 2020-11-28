const express = require('express');

const router = express.Router({ mergeParams: true });

//Import from Controllers
const reviews = require('../controllers/reviews');

//Error Middleware
const catchAsync = require('../utils/catchAsync');

//Middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//Submit Route for A New Campground Review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//Review Delete Route  
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;