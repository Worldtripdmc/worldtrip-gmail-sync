const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema(
  {
    // ==========================================
    // GMAIL MESSAGE ID
    // ==========================================

    gmailId: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // MAILBOX FROM WHICH EMAIL WAS SYNCED
    // ==========================================

    mailbox: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // GMAIL THREAD
    // ==========================================

    threadId: {
      type: String,
    },

    // ==========================================
    // EMAIL DETAILS
    // ==========================================

    from: {
      type: String,
      default: "",
    },

    to: {
      type: String,
      default: "",
    },

    cc: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    snippet: {
      type: String,
      default: "",
    },

    body: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
    },

    // ==========================================
    // GMAIL LABELS
    // ==========================================

    labels: {
      type: [String],
      default: [],
    },

    // ==========================================
    // READ STATUS
    // ==========================================

    isRead: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // ATTACHMENTS
    // ==========================================

    attachments: [
      {
        filename: String,
        mimeType: String,
        attachmentId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ==========================================
// UNIQUE EMAIL PER MAILBOX
// ==========================================

EmailSchema.index(
  {
    mailbox: 1,
    gmailId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Email", EmailSchema);