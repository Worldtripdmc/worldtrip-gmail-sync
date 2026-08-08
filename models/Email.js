const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema(
  {
    gmailId: {
      type: String,
      unique: true,
      required: true,
    },

    threadId: String,

    from: String,

    to: String,

    cc: String,

    subject: String,

    snippet: String,

    body: String,

    date: Date,

    labels: [String],

    isRead: Boolean,

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

module.exports = mongoose.model("Email", EmailSchema);