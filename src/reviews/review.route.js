const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { 
  postAReview, 
  getTotalReviewsCount, 
  getUsersReview 
} = require('./review.controller');

// post a review
router.post("/post-review", verifyToken, postAReview);

// review counts 
router.get("/total-reviews", getTotalReviewsCount)

// get review data for user
router.get("/:userId", getUsersReview);

module.exports = router;