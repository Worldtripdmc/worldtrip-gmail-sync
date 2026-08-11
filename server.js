const express = require("express");
const cors = require("cors");
require("dotenv").config();

const gmailRoutes = require("./routes/gmailRoutes");
const connectDB = require("./config/db");
const { syncEmails } = require("./services/gmailSyncService");

// ==========================================
// APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

// ==========================================
// GMAIL ROUTES
// ==========================================

console.log("Gmail Routes Loaded");

app.use("/api/gmail", (req, res, next) => {
  console.log(
    `Incoming: ${req.method} ${req.originalUrl}`
  );

  next();
});

app.use(
  "/api/gmail",
  gmailRoutes
);

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.send(
    "World Trip Gmail Sync API Running..."
  );
});

// ==========================================
// AUTOMATIC GMAIL SYNC
// ==========================================
//
// Server start hone par:
// ❌ Gmail sync immediately nahi chalega
//
// Server start ke 10 minutes baad:
// ✅ Automatic Gmail sync chalega
//
// Uske baad:
// ✅ Har 10 minutes sync
//
// Agar previous sync abhi bhi running hai:
// ⏭️ Next cycle skip hoga
// ==========================================

let gmailSyncRunning = false;

// ==========================================
// RUN AUTOMATIC SYNC
// ==========================================

const runAutomaticGmailSync = async () => {

  // ======================================
  // PREVENT OVERLAPPING SYNC
  // ======================================

  if (gmailSyncRunning) {
    console.log(
      "⏳ Gmail sync already running. Skipping this cycle."
    );

    return;
  }

  try {

    gmailSyncRunning = true;

    console.log(
      "\n=================================="
    );

    console.log(
      "🤖 Automatic Gmail Sync Started"
    );

    console.log(
      new Date().toLocaleString(
        "en-IN",
        {
          timeZone:
            "Asia/Kolkata",
        }
      )
    );

    console.log(
      "=================================="
    );

    const result =
      await syncEmails();

    // ====================================
    // RESULT
    // ====================================

    if (result.success) {

      console.log(
        "\n✅ Automatic Gmail Sync Completed"
      );

      console.log(
        `📥 Scanned: ${result.scanned}`
      );

      console.log(
        `⏭️ Already Exists: ${result.alreadyExists}`
      );

      console.log(
        `🆕 Newly Inserted: ${result.inserted}`
      );

      console.log(
        `❌ Failed: ${result.failed}`
      );

    } else {

      console.error(
        "\n❌ Automatic Gmail Sync Failed:"
      );

      console.error(
        result.message
      );
    }

  } catch (error) {

    console.error(
      "\n❌ Automatic Gmail Sync Error:"
    );

    console.error(error);

  } finally {

    gmailSyncRunning = false;

    console.log(
      "==================================\n"
    );
  }
};

// ==========================================
// DATABASE + SERVER
// ==========================================

connectDB();

const PORT =
  process.env.PORT || 8000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    "=================================="
  );

  console.log(
    "📧 Automatic Gmail Sync Enabled"
  );

  console.log(
    "⏱️ First automatic sync: After 10 Minutes"
  );

  console.log(
    "⏱️ Sync Interval: Every 10 Minutes"
  );

  console.log(
    "=================================="
  );

  console.log(
    "⏳ Initial Gmail sync skipped."
  );

  console.log(
    "📅 Next automatic Gmail sync will run in 10 minutes."
  );

  // ========================================
  // REPEATED SYNC
  // ========================================
  //
  // 10 minutes = 600000 milliseconds
  //

  setInterval(
    runAutomaticGmailSync,
    10 * 60 * 1000
  );
});