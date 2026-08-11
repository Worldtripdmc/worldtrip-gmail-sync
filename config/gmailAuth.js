const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// ==========================================
// SERVICE ACCOUNT CREDENTIALS
// ==========================================

const CREDENTIALS_PATH = path.join(
  __dirname,
  "../credentials/credentials.json"
);

const credentials = JSON.parse(
  fs.readFileSync(CREDENTIALS_PATH, "utf8")
);

// ==========================================
// DOMAIN-WIDE DELEGATION SCOPES
// ==========================================

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
];

// ==========================================
// CREATE AUTH CLIENT FOR A MAILBOX
// ==========================================

function getGmailAuth(userEmail) {
  if (!userEmail) {
    throw new Error(
      "Gmail user email is required for impersonation."
    );
  }

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
    subject: userEmail,
  });
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getGmailAuth,
};