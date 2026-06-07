const mongoose = require("mongoose");

// Single document — singleton pattern (key: "global")
const siteStatsSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  totalVisitors: { type: Number, default: 0 },
  // Array of unique deviceIds seen today — reset each day
  todayDate: { type: String, default: "" },
  todayVisitors: { type: [String], default: [] },
  // All-time unique deviceIds — stored to deduplicate across restarts
  allVisitors: { type: [String], default: [] },
});

module.exports = mongoose.model("SiteStats", siteStatsSchema);
