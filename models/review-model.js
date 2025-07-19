// review-model.js
const pool = require('../database');

module.exports = {
  async getReviewsByInventory(inv_id) {
    const sql = `SELECT r.review_id, r.review_text, r.review_date, a.account_id, a.account_firstname, a.account_lastname
                 FROM review r
                 JOIN account a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1
                 ORDER BY r.review_date DESC`;
    const { rows } = await pool.query(sql, [inv_id]);
    return rows;
  },

  async addReview(review_text, inv_id, account_id) {
    const sql = `INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *`;
    const { rows } = await pool.query(sql, [review_text, inv_id, account_id]);
    return rows[0];
  },

  async getReviewsByAccount(account_id) {
    const sql = `SELECT r.review_id, r.review_text, r.review_date, r.inv_id
                 FROM review r
                 WHERE r.account_id = $1
                 ORDER BY r.review_date DESC`;
    const { rows } = await pool.query(sql, [account_id]);
    return rows;
  },

  async getReviewById(review_id) {
    const sql = `SELECT * FROM review WHERE review_id = $1`;
    const { rows } = await pool.query(sql, [review_id]);
    return rows[0];
  },

  async updateReview(review_id, review_text) {
    const sql = `UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *`;
    const { rows } = await pool.query(sql, [review_text, review_id]);
    return rows[0];
  },

  async deleteReview(review_id) {
    const sql = `DELETE FROM review WHERE review_id = $1`;
    await pool.query(sql, [review_id]);
  }
};
