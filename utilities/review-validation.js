// review-validation.js
const { body, validationResult } = require('express-validator');

const reviewValidationRules = () => [
  body('review_text')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Review must be between 3 and 1000 characters.'),
];

const checkReviewData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Re-render the detail view with errors and sticky form
    const inv_id = req.body.inv_id;
    const reviewModel = require('../models/review-model');
    const invModel = require('../models/inventory-model');
    const utilities = require('../utilities');
    const vehicle = await invModel.getVehicleById(inv_id);
    let nav = await utilities.getNav();
    const detail = await utilities.buildDetailView(vehicle);
    const reviews = await reviewModel.getReviewsByInventory(inv_id);
    const loggedin = res.locals.loggedin;
    const accountData = res.locals.accountData;
    res.render('inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      detail,
      reviews,
      loggedin,
      accountData,
      inv_id,
      errors: errors.array(),
      review_text: req.body.review_text
    });
    return;
  }
  next();
};

module.exports = { reviewValidationRules, checkReviewData };
