const mongoose = require("mongoose");

// Tracks each device/browser session admin has logged in from.
const adminSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    deviceLabel: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSession", adminSessionSchema);
