const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (typeof regResult === "object" && regResult.rows && regResult.rows.length > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else if (typeof regResult === "string") {
    req.flash("notice", `Registration failed: ${regResult}`)
    res.status(400).render("account/registration", {
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(400).render("account/registration", {
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: null
    })
  }
}

/* ****************************************
*  Process login attempt
* *************************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // For now, just send a success message
  // You'll implement actual authentication logic later
  req.flash("notice", "Login functionality not yet implemented.")
  res.status(200).render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/**
 * Deliver the account update view
 */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id || req.body.account_id || (res.locals.accountData && res.locals.accountData.account_id);
  const account = await accountModel.getAccountById(account_id);
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    locals: { accountData: account },
  });
}

/**
 * Handle account info update
 */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  // Update in DB
  const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
  if (updateResult && updateResult.account_id) {
    req.flash("notice", "Account information updated successfully.");
    // Get updated account for management view
    const updatedAccount = await accountModel.getAccountById(account_id);
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      locals: { accountData: updatedAccount },
      errors: null,
    });
  } else {
    req.flash("notice", "Account update failed. Please try again.");
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      locals: { accountData: { account_id, account_firstname, account_lastname, account_email } },
    });
  }
}

/**
 * Handle password update
 */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updateAccountPassword(account_id, hashedPassword);
    if (updateResult && updateResult.account_id) {
      req.flash("notice", "Password updated successfully.");
      const updatedAccount = await accountModel.getAccountById(account_id);
      res.render("account/account-management", {
        title: "Account Management",
        nav,
        locals: { accountData: updatedAccount },
        errors: null,
      });
    } else {
      req.flash("notice", "Password update failed. Please try again.");
      res.render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        locals: { accountData: { account_id } },
      });
    }
  } catch (err) {
    req.flash("notice", "Password update failed. Please try again.");
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      locals: { accountData: { account_id } },
    });
  }
}

/**
 * Logout process: clear JWT cookie and redirect to home
 */
async function logout(req, res) {
  res.clearCookie('jwt');
  req.flash('notice', 'You have been logged out.');
  res.redirect('/');
}

module.exports = {
  buildLogin,
  buildRegistration,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  logout
};