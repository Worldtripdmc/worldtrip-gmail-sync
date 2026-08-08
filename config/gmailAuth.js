const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(
  __dirname,
  "../credentials/credentials.json"
);

const TOKEN_PATH = path.join(
  __dirname,
  "../credentials/token.json"
);

const content = fs.readFileSync(CREDENTIALS_PATH);
const credentials = JSON.parse(content);

const { client_id, client_secret, redirect_uris } = credentials.web;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Load saved token
if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oauth2Client.setCredentials(token);
  console.log("✅ Gmail token loaded");
} else {
  console.log("❌ token.json not found");
}

module.exports = oauth2Client;