const mongoose = require("mongoose");

const GmailMailboxSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    syncEnabled: {
      type: Boolean,
      default: true,
    },

    lastSyncAt: {
      type: Date,
      default: null,
    },

    lastSyncStatus: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "PENDING",
    },

    lastSyncError: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GmailMailbox",
  GmailMailboxSchema
);