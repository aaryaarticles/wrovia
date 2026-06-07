const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const { cloudinary } = require("../config/cloudinaryConfig");

function isAdmin(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.status(401).json({ success: false, message: "Unauthorized!" });
}

// Helper: aaj ki date "YYYY-MM-DD"
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// CREATE
router.post("/", isAdmin, async (req, res) => {
  try {
    let { title, desc, content, imageUrl, imagePublicId, category, tags } = req.body;
    let processedTags = [];
    if (typeof tags === "string") processedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    else if (Array.isArray(tags)) processedTags = tags;
    const newArticle = new Article({
      title, desc, content,
      image: { url: imageUrl, public_id: imagePublicId || null },
      category, tags: processedTags,
    });
    const saved = await newArticle.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// LIST
router.get("/", async (req, res) => {
  try {
    if (req.query.all === "true") {
      const articles = await Article.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: articles, total: articles.length });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const articles = await Article.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Article.countDocuments();
    res.json({ success: true, data: articles, page, limit, total, hasMore: skip + articles.length < total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SINGLE
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article nahi mila" });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// VIEW — all-time + today track
router.post("/:id/view", async (req, res) => {
  try {
    const { deviceId } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false });

    const today = todayStr();
    const isNewViewer = deviceId && !article.viewedBy.includes(deviceId);

    if (isNewViewer) {
      article.views += 1;
      article.viewedBy.push(deviceId);

      // Reset today counter if new day
      if (article.todayDate !== today) {
        article.todayDate  = today;
        article.todayViews = 1;
        article.todayLikes = 0; // views reset karo, likes apni jagah rahe
      } else {
        article.todayViews += 1;
      }

      await article.save();
    }

    res.json({ success: true, views: article.views });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// LIKE — all-time + today track
router.post("/:id/like", async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ success: false });

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false });

    const today = todayStr();
    const liked = article.likedBy.includes(deviceId);

    // Reset today counters if new day
    if (article.todayDate !== today) {
      article.todayDate  = today;
      article.todayViews = 0;
      article.todayLikes = 0;
    }

    if (liked) {
      // Unlike
      article.likes = Math.max(0, article.likes - 1);
      article.likedBy = article.likedBy.filter((d) => d !== deviceId);
      article.todayLikes = Math.max(0, article.todayLikes - 1);
    } else {
      // Like
      article.likes += 1;
      article.likedBy.push(deviceId);
      article.todayLikes += 1;
    }

    await article.save();
    res.json({ success: true, likes: article.likes, liked: !liked });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// UPDATE
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { title, desc, content, imageUrl, imagePublicId, category, tags } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Not found" });
    let processedTags = article.tags;
    if (typeof tags === "string") processedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    else if (Array.isArray(tags)) processedTags = tags;
    if (imageUrl && imageUrl !== article.image.url) {
      if (article.image?.public_id) await cloudinary.uploader.destroy(article.image.public_id).catch(() => {});
      article.image = { url: imageUrl, public_id: imagePublicId || null };
    }
    article.title    = title    || article.title;
    article.desc     = desc     || article.desc;
    article.content  = content  || article.content;
    article.category = category || article.category;
    article.tags     = processedTags;
    const updated = await article.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false });
    if (article.image?.public_id) await cloudinary.uploader.destroy(article.image.public_id).catch(() => {});
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
