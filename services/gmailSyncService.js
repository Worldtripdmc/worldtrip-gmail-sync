const { google } = require("googleapis");

const { getGmailAuth } = require("../config/gmailAuth");

const Email = require("../models/Email");
const GmailMailbox = require("../models/GmailMailbox");

// ==========================================
// FETCH FULL EMAIL DETAILS
// ==========================================

async function fetchEmailDetails(gmail, messageId, mailbox) {
  const details = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const payload = details.data.payload || {};
  const headers = payload.headers || [];

  const getHeader = (name) =>
    headers.find(
      (h) =>
        h.name.toLowerCase() === name.toLowerCase()
    )?.value || "";

  const emailData = {
    gmailId: details.data.id,

    mailbox: mailbox,

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

    isRead: !(
      details.data.labelIds || []
    ).includes("UNREAD"),

    attachments: [],
  };

  return emailData;
}

// ==========================================
// SYNC ONE MAILBOX
// ==========================================

async function syncSingleMailbox(mailboxData) {
  const mailbox = mailboxData.email;

  console.log("\n==================================");
  console.log(`📧 Mailbox: ${mailbox}`);
  console.log("==================================");

  try {
    // ======================================
    // CREATE AUTH FOR THIS MAILBOX
    // ======================================

    const auth = getGmailAuth(mailbox);

    const gmail = google.gmail({
      version: "v1",
      auth,
    });

    console.log(
      `🔐 Authentication ready: ${mailbox}`
    );

    // ======================================
    // VARIABLES
    // ======================================

    let nextPageToken = null;

    let totalScanned = 0;
    let alreadyExists = 0;
    let newEmails = 0;
    let failed = 0;

    // ======================================
    // PROCESS ALL GMAIL PAGES
    // ======================================

    do {
      const response =
        await gmail.users.messages.list({
          userId: "me",

          maxResults: 500,

          pageToken: nextPageToken,
        });

      const messages =
        response.data.messages || [];

      totalScanned += messages.length;

      console.log(
        `📥 ${mailbox} | Scanned: ${totalScanned}`
      );

      // ====================================
      // IF NO MESSAGES
      // ====================================

      if (messages.length === 0) {
        nextPageToken =
          response.data.nextPageToken;

        continue;
      }

      // ====================================
      // GET GMAIL IDS
      // ====================================

      const gmailIds = messages.map(
        (message) => message.id
      );

      // ====================================
      // CHECK EXISTING EMAILS
      // ====================================

      const existingEmails =
        await Email.find(
          {
            mailbox: mailbox,

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

      const newMessages =
        messages.filter(
          (message) =>
            !existingIds.has(
              message.id
            )
        );

      alreadyExists +=
        messages.length -
        newMessages.length;

      console.log(
        `⏭️ ${mailbox} | Existing: ${alreadyExists}`
      );

      console.log(
        `🆕 ${mailbox} | New batch: ${newMessages.length}`
      );

      // ====================================
      // PROCESS 10 AT A TIME
      // ====================================

      const BATCH_SIZE = 10;

      for (
        let i = 0;
        i < newMessages.length;
        i += BATCH_SIZE
      ) {
        const batch =
          newMessages.slice(
            i,
            i + BATCH_SIZE
          );

        const results =
          await Promise.allSettled(
            batch.map(
              async (message) => {
                const emailData =
                  await fetchEmailDetails(
                    gmail,
                    message.id,
                    mailbox
                  );

                await Email.updateOne(
                  {
                    mailbox: mailbox,

                    gmailId:
                      emailData.gmailId,
                  },
                  {
                    $setOnInsert:
                      emailData,
                  },
                  {
                    upsert: true,
                  }
                );

                return true;
              }
            )
          );

        for (const result of results) {
          if (
            result.status ===
            "fulfilled"
          ) {
            newEmails++;
          } else {
            failed++;

            console.log(
              `❌ ${mailbox} | Email sync failed:`,
              result.reason?.message ||
                result.reason
            );
          }
        }

        console.log(
          `💾 ${mailbox} | Saved: ${newEmails}`
        );
      }

      // ====================================
      // NEXT PAGE
      // ====================================

      nextPageToken =
        response.data.nextPageToken;
    } while (nextPageToken);

    // ======================================
    // UPDATE MAILBOX STATUS
    // ======================================

    await GmailMailbox.updateOne(
      {
        _id: mailboxData._id,
      },
      {
        $set: {
          lastSyncAt: new Date(),

          lastSyncStatus:
            failed > 0
              ? "FAILED"
              : "SUCCESS",

          lastSyncError:
            failed > 0
              ? `${failed} email(s) failed`
              : "",
        },
      }
    );

    console.log("\n----------------------------------");
    console.log(
      `✅ ${mailbox} Sync Completed`
    );
    console.log(
      `📥 Scanned: ${totalScanned}`
    );
    console.log(
      `⏭️ Existing: ${alreadyExists}`
    );
    console.log(
      `🆕 Inserted: ${newEmails}`
    );
    console.log(
      `❌ Failed: ${failed}`
    );
    console.log("----------------------------------");

    return {
      mailbox,

      success: true,

      scanned: totalScanned,

      alreadyExists,

      inserted: newEmails,

      failed,
    };
  } catch (error) {
    console.error(
      `\n❌ Mailbox sync failed: ${mailbox}`
    );

    console.error(
      error.message
    );

    // ======================================
    // UPDATE FAILED STATUS
    // ======================================

    await GmailMailbox.updateOne(
      {
        _id: mailboxData._id,
      },
      {
        $set: {
          lastSyncAt: new Date(),

          lastSyncStatus:
            "FAILED",

          lastSyncError:
            error.message || "Unknown error",
        },
      }
    );

    return {
      mailbox,

      success: false,

      scanned: 0,

      alreadyExists: 0,

      inserted: 0,

      failed: 1,

      message: error.message,
    };
  }
}

// ==========================================
// SMART MULTI-MAILBOX GMAIL SYNC
// ==========================================

async function syncEmails() {
  console.log("\n==================================");
  console.log(
    "🚀 WORLD TRIP MULTI-MAILBOX GMAIL SYNC"
  );
  console.log("==================================");

  try {
    // ======================================
    // GET ACTIVE MAILBOXES
    // ======================================

    const mailboxes =
      await GmailMailbox.find({
        status: "ACTIVE",

        syncEnabled: true,
      }).sort({
        email: 1,
      });

    console.log(
      `📧 Active mailboxes: ${mailboxes.length}`
    );

    if (mailboxes.length === 0) {
      console.log(
        "⚠️ No active mailboxes found."
      );

      return {
        success: true,

        mailboxes: 0,

        results: [],
      };
    }

    const results = [];

    // ======================================
    // SYNC EACH MAILBOX
    // ======================================

    for (const mailbox of mailboxes) {
      const result =
        await syncSingleMailbox(
          mailbox
        );

      results.push(result);
    }

    // ======================================
    // FINAL SUMMARY
    // ======================================

    const totalScanned =
      results.reduce(
        (sum, item) =>
          sum + (item.scanned || 0),
        0
      );

    const totalInserted =
      results.reduce(
        (sum, item) =>
          sum + (item.inserted || 0),
        0
      );

    const totalExisting =
      results.reduce(
        (sum, item) =>
          sum +
          (item.alreadyExists || 0),
        0
      );

    const totalFailed =
      results.reduce(
        (sum, item) =>
          sum + (item.failed || 0),
        0
      );

    console.log("\n==================================");
    console.log(
      "✅ WORLD TRIP MULTI-MAILBOX SYNC COMPLETED"
    );
    console.log("==================================");

    console.log(
      "📧 Mailboxes:",
      mailboxes.length
    );

    console.log(
      "📥 Total Scanned:",
      totalScanned
    );

    console.log(
      "⏭️ Total Existing:",
      totalExisting
    );

    console.log(
      "🆕 Total Inserted:",
      totalInserted
    );

    console.log(
      "❌ Total Failed:",
      totalFailed
    );

    console.log("==================================\n");

    return {
      success: true,

      mailboxes:
        mailboxes.length,

      scanned: totalScanned,

      alreadyExists:
        totalExisting,

      inserted:
        totalInserted,

      failed:
        totalFailed,

      results,
    };
  } catch (error) {
    console.error(
      "\n❌ Multi-mailbox Gmail Sync Error"
    );

    console.error(
      error.message
    );

    return {
      success: false,

      message:
        error.message,
    };
  }
}

module.exports = {
  syncEmails,
  syncSingleMailbox,
};