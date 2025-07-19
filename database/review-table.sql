-- SQL for creating the review table and relationships
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    review_text TEXT NOT NULL,
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    inv_id INTEGER NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES account(account_id) ON DELETE CASCADE
);

-- Index for faster lookup by inventory
CREATE INDEX idx_review_inv_id ON review(inv_id);
-- Index for faster lookup by account
CREATE INDEX idx_review_account_id ON review(account_id);
