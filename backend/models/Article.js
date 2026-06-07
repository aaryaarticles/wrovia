const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true },
    content: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, default: null },
    },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true, index: true },
    tags: { type: [String], index: true },

    // All-time stats
    views: { type: Number, default: 0 },
    viewedBy: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },

    // Today's stats (reset each day)
    todayDate:  { type: String, default: "" },   // "YYYY-MM-DD"
    todayViews: { type: Number, default: 0 },
    todayLikes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
