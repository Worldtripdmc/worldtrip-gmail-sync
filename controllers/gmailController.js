const Email = require("../models/Email");
const GmailMailbox = require("../models/GmailMailbox");
const { syncEmails } = require("../services/gmailSyncService");

// ==========================================
// HELPERS
// ==========================================

const extractEmail = (value = "") => {
  const match = String(value).match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return match
    ? match[0].toLowerCase()
    : "";
};

// ==========================================
// EXTRACT NAME
// ==========================================

const extractName = (value = "") => {
  const text =
    String(value || "").trim();

  if (!text) {
    return "";
  }

  const emailMatch =
    text.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    );

  if (!emailMatch) {
    return text;
  }

  return text
    .replace(
      emailMatch[0],
      ""
    )
    .replace(
      /[<>"]/g,
      ""
    )
    .trim();
};

// ==========================================
// GET DOMAIN
// ==========================================

const getDomain = (email = "") => {
  const parts =
    String(email)
      .toLowerCase()
      .split("@");

  return parts.length === 2
    ? parts[1]
    : "";
};

// ==========================================
// INDIA DATE RANGE
// ==========================================

const getIndiaDayRange = (
  dateString
) => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      dateString
    )
  ) {
    return null;
  }

  const start = new Date(
    `${dateString}T00:00:00+05:30`
  );

  if (
    Number.isNaN(
      start.getTime()
    )
  ) {
    return null;
  }

  const end = new Date(
    start.getTime() +
      24 * 60 * 60 * 1000
  );

  return {
    start,
    end,
  };
};

// ==========================================
// GET EMAILS
// ==========================================
//
// GET:
// /api/gmail/emails
//
// GET:
// /api/gmail/emails?mailbox=avdhesh@worldtripdmc.com
//
// GET:
// /api/gmail/emails?page=1&limit=50
//
// ==========================================

const getEmails = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      parseInt(
        req.query.page
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(
          req.query.limit
        ) || 50,
        1
      ),
      100
    );

    const skip =
      (page - 1) *
      limit;

    const search =
      (
        req.query.search ||
        ""
      ).trim();

    const mailbox =
      (
        req.query.mailbox ||
        ""
      )
        .trim()
        .toLowerCase();

    const query = {};

    // ======================================
    // MAILBOX FILTER
    // ======================================

    if (mailbox) {
      query.mailbox =
        mailbox;
    }

    // ======================================
    // SEARCH
    // ======================================

    if (search) {
      query.$or = [
        {
          from: {
            $regex: search,
            $options: "i",
          },
        },

        {
          to: {
            $regex: search,
            $options: "i",
          },
        },

        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },

        {
          snippet: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ======================================
    // TOTAL
    // ======================================

    const total =
      await Email.countDocuments(
        query
      );

    // ======================================
    // EMAILS
    // ======================================

    const emails =
      await Email.find(query)
        .sort({
          date: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

    // ======================================
    // TOTAL PAGES
    // ======================================

    const totalPages =
      Math.ceil(
        total / limit
      );

    // ======================================
    // RESPONSE
    // ======================================

    res.json({
      success: true,

      mailbox:
        mailbox || "ALL",

      data: emails,

      pagination: {
        page,
        limit,
        total,
        totalPages,

        hasNextPage:
          page <
          totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get Emails Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// ==========================================
// GET EMAIL CONTACT DATABASE
// ==========================================
//
// IMPORTANT:
//
// Old implementation used:
//
// MongoDB $sort
// MongoDB $group
// MongoDB $sort
//
// With 333K+ emails this caused:
//
// Sort exceeded memory limit
//
// This implementation uses a MongoDB
// cursor and Node.js Map.
//
// No MongoDB aggregation.
// No MongoDB sort.
// No MongoDB group.
//
// Pagination is applied AFTER unique
// contacts are generated.
//
// ==========================================

const getEmailContacts = async (
  req,
  res
) => {
  try {
    // ======================================
    // PAGINATION
    // ======================================

    const page = Math.max(
      parseInt(
        req.query.page
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(
          req.query.limit
        ) || 50,
        1
      ),
      100
    );

    const search =
      (
        req.query.search ||
        ""
      ).trim();

    const mailbox =
      (
        req.query.mailbox ||
        ""
      )
        .trim()
        .toLowerCase();

    // ======================================
    // QUERY
    // ======================================

    const query = {};

    // ======================================
    // MAILBOX
    // ======================================

    if (mailbox) {
      query.mailbox =
        mailbox;
    }

    // ======================================
    // SEARCH
    // ======================================

    if (search) {
      query.$or = [
        {
          from: {
            $regex: search,
            $options: "i",
          },
        },

        {
          to: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ======================================
    // CONTACT MAP
    // ======================================

    const contactMap =
      new Map();

    // ======================================
    // MONGODB CURSOR
    // ======================================
    //
    // Only required fields are read.
    //
    // NO aggregation.
    // NO sort.
    // NO group.
    //
    // ======================================

    const cursor =
      Email.find(query)
        .select({
          from: 1,
          date: 1,
        })
        .lean()
        .cursor();

    let scanned = 0;

    // ======================================
    // PROCESS EMAILS
    // ======================================

    for await (
      const email of cursor
    ) {
      scanned++;

      const senderEmail =
        extractEmail(
          email.from || ""
        );

      // ------------------------------------
      // INVALID EMAIL
      // ------------------------------------

      if (!senderEmail) {
        continue;
      }

      const normalizedEmail =
        senderEmail.toLowerCase();

      const emailDate =
        email.date
          ? new Date(
              email.date
            )
          : null;

      const senderName =
        extractName(
          email.from || ""
        );

      // ====================================
      // NEW CONTACT
      // ====================================

      if (
        !contactMap.has(
          normalizedEmail
        )
      ) {
        contactMap.set(
          normalizedEmail,
          {
            email:
              normalizedEmail,

            name:
              senderName ||
              normalizedEmail,

            firstEmail:
              emailDate,

            lastEmail:
              emailDate,

            totalEmails: 1,

            source:
              "Gmail",

            status:
              "Active",

            domain:
              getDomain(
                normalizedEmail
              ),
          }
        );

        continue;
      }

      // ====================================
      // EXISTING CONTACT
      // ====================================

      const contact =
        contactMap.get(
          normalizedEmail
        );

      contact.totalEmails++;

      // ====================================
      // FIRST EMAIL
      // ====================================

      if (
        emailDate &&
        (
          !contact.firstEmail ||
          emailDate <
            contact.firstEmail
        )
      ) {
        contact.firstEmail =
          emailDate;
      }

      // ====================================
      // LAST EMAIL
      // ====================================

      if (
        emailDate &&
        (
          !contact.lastEmail ||
          emailDate >
            contact.lastEmail
        )
      ) {
        contact.lastEmail =
          emailDate;

        if (senderName) {
          contact.name =
            senderName;
        }
      }
    }

    // ======================================
    // CONTACT ARRAY
    // ======================================

    const allContacts =
      Array.from(
        contactMap.values()
      );

    // ======================================
    // SORT CONTACTS IN NODE.JS
    // ======================================
    //
    // MongoDB sorting is NOT used.
    //
    // Only unique contacts are sorted here.
    //
    // ======================================

    allContacts.sort(
      (a, b) => {
        const dateA =
          a.lastEmail
            ? new Date(
                a.lastEmail
              ).getTime()
            : 0;

        const dateB =
          b.lastEmail
            ? new Date(
                b.lastEmail
              ).getTime()
            : 0;

        if (
          dateB !== dateA
        ) {
          return (
            dateB -
            dateA
          );
        }

        return a.email.localeCompare(
          b.email
        );
      }
    );

    // ======================================
    // TOTAL CONTACTS
    // ======================================

    const total =
      allContacts.length;

    const totalPages =
      Math.ceil(
        total / limit
      );

    // ======================================
    // PAGINATION SLICE
    // ======================================

    const startIndex =
      (page - 1) *
      limit;

    const contacts =
      allContacts.slice(
        startIndex,
        startIndex + limit
      );

    // ======================================
    // LOG
    // ======================================

    console.log(
      `📇 Contacts scanned: ${scanned}`
    );

    console.log(
      `📇 Unique contacts: ${total}`
    );

    console.log(
      `📄 Contacts page: ${page}/${totalPages}`
    );

    // ======================================
    // RESPONSE
    // ======================================

    res.json({
      success: true,

      mailbox:
        mailbox || "ALL",

      count:
        contacts.length,

      data:
        contacts,

      pagination: {
        page,

        limit,

        total,

        totalPages,

        hasNextPage:
          page <
          totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get Email Contacts Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to load email contacts",
    });
  }
};

// ==========================================
// GET SINGLE EMAIL
// ==========================================

const getEmailById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const email =
      await Email.findById(
        id
      ).lean();

    if (!email) {
      return res.status(
        404
      ).json({
        success: false,

        message:
          "Email not found",
      });
    }

    res.json({
      success: true,

      data: email,
    });
  } catch (error) {
    console.error(
      "❌ Get Email Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ==========================================
// DAILY EMAIL REPORT
// ==========================================
//
// GET:
// /api/gmail/daily-report
//
// GET:
// /api/gmail/daily-report?date=2026-08-09
//
// NEW CONTACT:
// Sender ka selected date se pehle
// koi received email nahi mila.
//
// EXISTING CONTACT:
// Sender ka selected date se pehle
// received email already available hai.
//
// SENT emails report mein include nahi honge.
//
// ==========================================

const getDailyEmailReport =
  async (
    req,
    res
  ) => {
    try {
      // ====================================
      // DATE
      // ====================================

      const requestedDate =
        (
          req.query.date ||
          ""
        ).trim();

      const dateString =
        requestedDate ||
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:
              "Asia/Kolkata",
          }
        ).format(
          new Date()
        );

      // ====================================
      // DATE RANGE
      // ====================================

      const range =
        getIndiaDayRange(
          dateString
        );

      if (!range) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid date. Use YYYY-MM-DD format.",
        });
      }

      const {
        start,
        end,
      } = range;

      // ====================================
      // DAILY EMAILS
      // ====================================

      const dailyEmails =
        await Email.find({
          date: {
            $gte: start,
            $lt: end,
          },

          labels: {
            $nin: [
              "SENT",
            ],
          },
        })
          .sort({
            date: 1,
          })
          .lean();

      // ====================================
      // NORMALIZE SENDERS
      // ====================================

      const normalizedEmails =
        dailyEmails
          .map(
            (email) => {
              const senderEmail =
                extractEmail(
                  email.from
                );

              return {
                ...email,

                senderEmail,

                senderName:
                  extractName(
                    email.from
                  ),
              };
            }
          )
          .filter(
            (email) =>
              email.senderEmail
          );

      // ====================================
      // UNIQUE SENDERS
      // ====================================

      const uniqueSenders =
        [
          ...new Set(
            normalizedEmails.map(
              (email) =>
                email.senderEmail
            )
          ),
        ];

      // ====================================
      // PREVIOUS SENDERS
      // ====================================

      const previousSenderRows =
        uniqueSenders.length
          ? await Email.aggregate(
              [
                {
                  $match: {
                    date: {
                      $lt: start,
                    },

                    labels: {
                      $nin: [
                        "SENT",
                      ],
                    },
                  },
                },

                {
                  $project: {
                    from: 1,
                  },
                },

                {
                  $set: {
                    senderEmail:
                      {
                        $let: {
                          vars: {
                            emailMatch:
                              {
                                $regexFind:
                                  {
                                    input:
                                      {
                                        $ifNull:
                                          [
                                            "$from",
                                            "",
                                          ],
                                      },

                                    regex:
                                      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
                                  },
                              },
                          },

                          in: {
                            $toLower:
                              {
                                $ifNull:
                                  [
                                    "$$emailMatch.match",
                                    "",
                                  ],
                              },
                          },
                        },
                      },
                  },
                },

                {
                  $match: {
                    senderEmail: {
                      $in:
                        uniqueSenders,
                    },
                  },
                },

                {
                  $group: {
                    _id:
                      "$senderEmail",
                  },
                },
              ]
            )
          : [];

      // ====================================
      // PREVIOUS SENDER SET
      // ====================================

      const previousSenders =
        new Set(
          previousSenderRows.map(
            (row) =>
              row._id
          )
        );

      // ====================================
      // BUILD REPORT
      // ====================================

      const reportData =
        normalizedEmails.map(
          (email) => {
            const contactStatus =
              previousSenders.has(
                email.senderEmail
              )
                ? "EXISTING"
                : "NEW";

            return {
              // --------------------------
              // CONTACT
              // --------------------------

              email:
                email.senderEmail,

              name:
                email.senderName ||
                email.senderEmail,

              domain:
                getDomain(
                  email.senderEmail
                ),

              // --------------------------
              // EMAIL DETAILS
              // --------------------------

              date:
                email.date,

              time:
                email.date
                  ? new Intl.DateTimeFormat(
                      "en-IN",
                      {
                        timeZone:
                          "Asia/Kolkata",

                        day:
                          "2-digit",

                        month:
                          "short",

                        year:
                          "numeric",

                        hour:
                          "2-digit",

                        minute:
                          "2-digit",

                        hour12:
                          true,
                      }
                    ).format(
                      new Date(
                        email.date
                      )
                    )
                  : "",

              subject:
                email.subject ||
                "",

              snippet:
                email.snippet ||
                "",

              gmailId:
                email.gmailId,

              threadId:
                email.threadId,

              // --------------------------
              // STATUS
              // --------------------------

              emailStatus:
                "NEW",

              contactStatus,

              // --------------------------
              // SOURCE
              // --------------------------

              source:
                "Gmail",
            };
          }
        );

      // ====================================
      // SUMMARY
      // ====================================

      const totalEmails =
        reportData.length;

      const uniqueContacts =
        new Set(
          reportData.map(
            (item) =>
              item.email
          )
        ).size;

      const newContacts =
        new Set(
          reportData
            .filter(
              (item) =>
                item.contactStatus ===
                "NEW"
            )
            .map(
              (item) =>
                item.email
            )
        ).size;

      const existingContacts =
        new Set(
          reportData
            .filter(
              (item) =>
                item.contactStatus ===
                "EXISTING"
            )
            .map(
              (item) =>
                item.email
            )
        ).size;

      // ====================================
      // RESPONSE
      // ====================================

      res.json({
        success: true,

        date:
          dateString,

        timezone:
          "Asia/Kolkata",

        summary: {
          totalEmails,

          uniqueContacts,

          newContacts,

          existingContacts,
        },

        data:
          reportData,
      });
    } catch (error) {
      console.error(
        "❌ Daily Email Report Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ==========================================
// RUN GMAIL SMART SYNC
// ==========================================

const runGmailSync =
  async (
    req,
    res
  ) => {
    try {
      console.log(
        "\n=================================="
      );

      console.log(
        "🚀 Manual Gmail Sync Requested"
      );

      console.log(
        "=================================="
      );

      const result =
        await syncEmails();

      // ====================================
      // SYNC FAILED
      // ====================================

      if (
        !result.success
      ) {
        return res.status(
          500
        ).json({
          success: false,

          message:
            result.message ||
            "Gmail sync failed",
        });
      }

      // ====================================
      // SYNC SUCCESS
      // ====================================

      res.json({
        success: true,

        message:
          "Gmail sync completed successfully",

        result,
      });
    } catch (error) {
      console.error(
        "❌ Gmail Sync Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ==========================================
// GET GMAIL MAILBOXES
// ==========================================
//
// GET:
// /api/gmail/mailboxes
//
// ==========================================

const getGmailMailboxes =
  async (
    req,
    res
  ) => {
    try {
      const mailboxes =
        await GmailMailbox.find(
          {}
        )
          .sort({
            email: 1,
          })
          .lean();

      res.json({
        success: true,

        count:
          mailboxes.length,

        data:
          mailboxes,
      });
    } catch (error) {
      console.error(
        "❌ Get Gmail Mailboxes Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getEmails,

  getEmailContacts,

  getEmailById,

  getDailyEmailReport,

  runGmailSync,

  getGmailMailboxes,
};