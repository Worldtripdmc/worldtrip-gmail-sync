const oauth2Client = require("../config/gmailAuth");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.join(__dirname, "../credentials/token.json");

// STEP 1
const auth = (req, res) => {

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  res.redirect(url);

};

// STEP 2
const callback = async (req, res) => {

  try {

    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    fs.writeFileSync(
      TOKEN_PATH,
      JSON.stringify(tokens, null, 2)
    );

    res.send("✅ Gmail Authorized Successfully. Token Saved.");

  } catch (error) {

    console.log(error);

    res.status(500).send("Authorization Failed");

  }

};

module.exports = {
  auth,
  callback,
};