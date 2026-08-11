const express = require("express");

const {
  getEmails,
  getEmailContacts,
  getEmailById,
  runGmailSync,
  getDailyEmailReport,
} = require("../controllers/gmailController");

const {
  exportEmailContacts,
} = require("../controllers/gmailExportController");

const router = express.Router();



// ==========================================
// GET EMAIL LIST
// ==========================================

router.get("/emails", getEmails);


// ==========================================
// GET EMAIL CONTACT DATABASE
// ==========================================

router.get("/contacts", getEmailContacts);

// ==========================================
// EXPORT EMAIL CONTACTS
// ==========================================

router.get(
  "/contacts/export",
  exportEmailContacts
);

// ==========================================
// DAILY EMAIL REPORT
// ==========================================

router.get(
  "/daily-report",
  getDailyEmailReport
);


// ==========================================
// GET SINGLE EMAIL
// ==========================================

router.get("/emails/:id", getEmailById);


// ==========================================
// MANUAL GMAIL SYNC
// ==========================================

router.get("/sync", runGmailSync);

// ==========================================
// DAILY EMAIL REPORT
// ==========================================

router.get(
  "/daily-report",
  getDailyEmailReport
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;