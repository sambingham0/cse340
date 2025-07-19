// reviewController.js
const reviewModel = require('../models/review-model');

module.exports = {
  async addReview(req, res) {
    const { review_text, inv_id, account_id } = req.body;
    if (!review_text || !inv_id || !account_id) {
      req.flash('error', 'All fields required.');
      return res.redirect(`/inv/detail/${inv_id}`);
    }
    await reviewModel.addReview(review_text, inv_id, account_id);
    req.flash('success', 'Review added!');
    res.redirect(`/inv/detail/${inv_id}`);
  },

  async editReviewForm(req, res) {
    const review = await reviewModel.getReviewById(req.params.review_id);
    if (!review || review.account_id !== res.locals.accountData.account_id) {
      req.flash('error', 'Unauthorized.');
      return res.redirect('/account');
    }
    res.render('review/edit-review', { review, errors: [] });
  },

  async updateReview(req, res) {
    const { review_id, review_text } = req.body;
    const review = await reviewModel.getReviewById(review_id);
    if (!review || review.account_id !== res.locals.accountData.account_id) {
      req.flash('error', 'Unauthorized.');
      return res.redirect('/account');
    }
    // If there are validation errors, they will be handled by middleware
    await reviewModel.updateReview(review_id, review_text);
    req.flash('success', 'Review updated!');
    res.redirect('/account');
  },

  async deleteReviewForm(req, res) {
    const review = await reviewModel.getReviewById(req.params.review_id);
    if (!review || review.account_id !== res.locals.accountData.account_id) {
      req.flash('error', 'Unauthorized.');
      return res.redirect('/account');
    }
    res.render('review/delete-review', { review });
  },

  async deleteReview(req, res) {
    const { review_id } = req.body;
    const review = await reviewModel.getReviewById(review_id);
    if (!review || review.account_id !== res.locals.accountData.account_id) {
      req.flash('error', 'Unauthorized.');
      return res.redirect('/account');
    }
    await reviewModel.deleteReview(review_id);
    req.flash('success', 'Review deleted!');
    res.redirect('/account');
  }
};
