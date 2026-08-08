const { google } = require("googleapis");
const oauth2Client = require("../config/gmailAuth");
const Email = require("../models/Email");

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

// ==========================================
// FETCH FULL EMAIL DETAILS
// ==========================================

async function fetchEmailDetails(messageId) {
  const details = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const payload = details.data.payload || {};
  const headers = payload.headers || [];

  const getHeader = (name) =>
    headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    )?.value || "";

  const emailData = {
    gmailId: details.data.id,
    threadId: details.data.threadId,

    from: getHeader("From"),
    to: getHeader("To"),
    cc: getHeader("Cc"),

    subject: getHeader("Subject"),

    snippet: details.data.snippet || "",

    body: "",

    date: getHeader("Date")
      ? new Date(getHeader("Date"))
      : new Date(),

    labels: details.data.labelIds || [],

    isRead: !(details.data.labelIds || []).includes("UNREAD"),

    attachments: [],
  };

  return emailData;
}


// ==========================================
// SMART GMAIL SYNC
// ==========================================

async function syncEmails() {

  try {

    console.log("\n==================================");
    console.log("🚀 Gmail Smart Sync Started");
    console.log("==================================");

    // ======================================
    // MAKE SURE ACCESS TOKEN IS AVAILABLE
    // ======================================

    await oauth2Client.getAccessToken();

    console.log("🔐 Gmail authentication ready");


    let nextPageToken = null;

    let totalScanned = 0;
    let alreadyExists = 0;
    let newEmails = 0;
    let failed = 0;


    // ======================================
    // PROCESS GMAIL PAGES
    // ======================================

    do {

      const response = await gmail.users.messages.list({
        userId: "me",

        maxResults: 500,

        pageToken: nextPageToken,
      });


      const messages = response.data.messages || [];


      totalScanned += messages.length;


      console.log(
        `📥 Gmail Messages Scanned : ${totalScanned}`
      );


      if (messages.length === 0) {
        nextPageToken = response.data.nextPageToken;
        continue;
      }


      // ====================================
      // GET EXISTING EMAIL IDS FROM MONGODB
      // ====================================

      const gmailIds = messages.map(
        (message) => message.id
      );


      const existingEmails = await Email.find(
        {
          gmailId: {
            $in: gmailIds,
          },
        },
        {
          gmailId: 1,
        }
      ).lean();


      const existingIds = new Set(
        existingEmails.map(
          (email) => email.gmailId
        )
      );


      // ====================================
      // ONLY NEW EMAILS
      // ====================================

      const newMessages = messages.filter(
        (message) =>
          !existingIds.has(message.id)
      );


      alreadyExists +=
        messages.length - newMessages.length;


      console.log(
        `⏭️ Already in MongoDB : ${alreadyExists}`
      );


      console.log(
        `🆕 New Emails in Batch : ${newMessages.length}`
      );


      // ====================================
      // PROCESS NEW EMAILS
      // 10 AT A TIME
      // ====================================

      const BATCH_SIZE = 10;


      for (
        let i = 0;
        i < newMessages.length;
        i += BATCH_SIZE
      ) {

        const batch = newMessages.slice(
          i,
          i + BATCH_SIZE
        );


        const results = await Promise.allSettled(

          batch.map(async (message) => {

            const emailData =
              await fetchEmailDetails(
                message.id
              );


            await Email.create(
              emailData
            );


            return true;

          })

        );


        for (const result of results) {

          if (result.status === "fulfilled") {

            newEmails++;

          } else {

            failed++;

            console.log(
              "❌ Email sync failed:",
              result.reason?.message ||
                result.reason
            );

          }

        }


        console.log(
          `💾 New Emails Saved : ${newEmails}`
        );

      }


      // ====================================
      // NEXT PAGE
      // ====================================

      nextPageToken =
        response.data.nextPageToken;


    } while (nextPageToken);


    // ======================================
    // SYNC COMPLETED
    // ======================================

    console.log("\n==================================");
    console.log("✅ Gmail Smart Sync Completed");
    console.log("==================================");

    console.log(
      "📥 Gmail Scanned :",
      totalScanned
    );

    console.log(
      "⏭️ Already Exists :",
      alreadyExists
    );

    console.log(
      "🆕 Newly Inserted :",
      newEmails
    );

    console.log(
      "❌ Failed :",
      failed
    );

    console.log("==================================\n");


    return {

      success: true,

      scanned: totalScanned,

      alreadyExists,

      inserted: newEmails,

      failed,

    };


  } catch (error) {

    console.log("\n❌ Gmail Sync Error");
    console.log(error);


    return {

      success: false,

      message: error.message,

    };

  }

}


module.exports = {
  syncEmails,
};