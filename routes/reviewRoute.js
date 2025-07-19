// review routes
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireLogin } = require('../utilities/account-validation');
const { reviewValidationRules, checkReviewData } = require('../utilities/review-validation');

router.post('/add', requireLogin, reviewValidationRules(), checkReviewData, reviewController.addReview);
router.get('/edit/:review_id', requireLogin, reviewController.editReviewForm);
router.post('/update', requireLogin, reviewValidationRules(), checkReviewData, reviewController.updateReview);
router.get('/delete/:review_id', requireLogin, reviewController.deleteReviewForm);
router.post('/delete', requireLogin, reviewController.deleteReview);

module.exports = router;
