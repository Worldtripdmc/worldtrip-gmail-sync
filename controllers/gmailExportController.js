const Email = require("../models/Email");

// ==========================================
// EXPORT EMAIL CONTACTS
// ==========================================
//
// GET:
// /api/gmail/contacts/export
//
// Optional:
// /api/gmail/contacts/export?mailbox=avdhesh@worldtripdmc.com
//
// Optional search:
// /api/gmail/contacts/export?search=tcsworld.in
//
// ==========================================

const exportEmailContacts = async (
  req,
  res
) => {
  try {
    const search =
      (req.query.search || "").trim();

    const mailbox =
      (req.query.mailbox || "").trim();

    const matchStage = {};

    // ======================================
    // MAILBOX FILTER
    // ======================================

    if (mailbox) {
      matchStage.mailbox = mailbox;
    }

    // ======================================
    // SEARCH FILTER
    // ======================================

    if (search) {
      matchStage.$or = [
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
    // CONTACT AGGREGATION
    // ======================================
    //
    // IMPORTANT:
    // No global sort before grouping.
    //
    // This is intentionally designed to avoid
    // MongoDB's 32MB sort memory problem.
    //
    // ======================================

    const contacts =
      await Email.aggregate([
        // ==================================
        // FILTER
        // ==================================

        {
          $match: matchStage,
        },

        // ==================================
        // EXTRACT EMAIL FROM FROM FIELD
        // ==================================

        {
          $addFields: {
            senderEmail: {
              $let: {
                vars: {
                  emailMatch: {
                    $regexFind: {
                      input: {
                        $ifNull: [
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
                  $ifNull: [
                    "$$emailMatch.match",
                    "$from",
                  ],
                },
              },
            },
          },
        },

        // ==================================
        // REMOVE EMPTY EMAILS
        // ==================================

        {
          $match: {
            senderEmail: {
              $nin: [
                "",
                null,
              ],
            },
          },
        },

        // ==================================
        // GROUP CONTACTS
        // ==================================

        {
          $group: {
            _id: {
              $toLower:
                "$senderEmail",
            },

            firstEmail: {
              $min: "$date",
            },

            lastEmail: {
              $max: "$date",
            },

            totalEmails: {
              $sum: 1,
            },

            latestContact: {
              $top: {
                sortBy: {
                  date: -1,
                },

                output: {
                  from: "$from",
                },
              },
            },
          },
        },

        // ==================================
        // FINAL FORMAT
        // ==================================

        {
          $project: {
            _id: 0,

            email: "$_id",

            name: {
              $let: {
                vars: {
                  latestFrom:
                    "$latestContact.from",
                },

                in: {
                  $cond: [
                    {
                      $regexMatch: {
                        input: {
                          $ifNull: [
                            "$$latestFrom",
                            "",
                          ],
                        },

                        regex: /</,
                      },
                    },

                    {
                      $trim: {
                        input: {
                          $arrayElemAt: [
                            {
                              $split: [
                                "$$latestFrom",
                                "<",
                              ],
                            },

                            0,
                          ],
                        },
                      },
                    },

                    "$$latestFrom",
                  ],
                },
              },
            },

            firstEmail: 1,

            lastEmail: 1,

            totalEmails: 1,

            source: {
              $literal:
                "Gmail",
            },

            status: {
              $literal:
                "Active",
            },

            domain: {
              $arrayElemAt: [
                {
                  $split: [
                    "$_id",
                    "@",
                  ],
                },

                1,
              ],
            },
          },
        },

        // ==================================
        // SORT ONLY CONTACT RESULTS
        // ==================================
        //
        // At this stage MongoDB has already
        // reduced hundreds of thousands of
        // emails to contact records.
        //
        // ==================================

        {
          $sort: {
            email: 1,
          },
        },
      ]);

      // ==========================================
// CLEAN EMAIL
// ==========================================

const cleanEmail = (value) => {
  if (!value) {
    return "";
  }

  let email = String(value).trim();

  // Remove mailto:
  email = email.replace(
    /^mailto:/i,
    ""
  );

  // Extract email from markdown link:
  const markdownMatch =
    email.match(
      /\[[^\]]+\]\(mailto:([^)]+)\)/i
    );

  if (markdownMatch) {
    return markdownMatch[1]
      .trim()
      .toLowerCase();
  }

  // Extract plain email if surrounded
  // by brackets or other text
  const emailMatch =
    email.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    );

  if (emailMatch) {
    return emailMatch[0]
      .trim()
      .toLowerCase();
  }

  return email
    .replace(/[\[\]]/g, "")
    .trim()
    .toLowerCase();
};

    // ======================================
    // CSV ESCAPE
    // ======================================

    const escapeCsv = (
      value
    ) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return `"${String(
        value
      ).replace(
        /"/g,
        '""'
      )}"`;
    };

    // ======================================
    // DATE FORMAT
    // ======================================

    const formatDate =
      (value) => {
        if (!value) {
          return "";
        }

        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return "";
        }

        return date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
      };

    // ======================================
    // CSV HEADER
    // ======================================

    const rows = [];

    rows.push(
      [
        "Email",
        "Name",
        "First Email",
        "Last Email",
        "Total Emails",
        "Source",
        "Status",
        "Domain",
      ]
        .map(escapeCsv)
        .join(",")
    );

    // ======================================
    // CSV DATA
    // ======================================

    for (
      const contact of contacts
    ) {
      rows.push(
        [
          cleanEmail(contact.email),

          contact.name,

          formatDate(
            contact.firstEmail
          ),

          formatDate(
            contact.lastEmail
          ),

          contact.totalEmails ||
            0,

          contact.source ||
            "Gmail",

          contact.status ||
            "Active",

          contact.domain,
        ]
          .map(
            escapeCsv
          )
          .join(",")
      );
    }

    // ======================================
    // UTF-8 BOM
    // ======================================
    //
    // Helps Excel / Google Sheets
    // correctly display Unicode names.
    //
    // ======================================

    const csv =
      "\uFEFF" +
      rows.join("\r\n");

    // ======================================
    // FILE NAME
    // ======================================

    const dateString =
      new Date()
        .toISOString()
        .slice(0, 10);

    const filename =
      `WorldTrip_Gmail_Contacts_${dateString}.csv`;

    // ======================================
    // RESPONSE HEADERS
    // ======================================

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // ======================================
    // SEND CSV
    // ======================================

    res.send(csv);

  } catch (error) {
    console.error(
      "❌ Export Email Contacts Error:",
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
// EXPORT
// ==========================================

module.exports = {
  exportEmailContacts,
};