require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const streamifier = require("streamifier");

const connectDB = require("./config/db");
const { cloudinary, uploadProvider } = require("./config/cloudinaryConfig");
const Article = require("./models/Article");
const AdminSession = require("./models/AdminSession");
const SiteStats = require("./models/SiteStats");
const articleRoutes = require("./routes/articleRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.set("trust proxy", true);

const FRONTEND = process.env.FRONTEND_ORIGIN || "https://explore-articles-1.onrender.com";
app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: "sessions" }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

function isAdminApi(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.status(401).json({ success: false, message: "Unauthorized!" });
}

// Refresh last-seen for current admin session on every authed request
app.use(async (req, res, next) => {
  try {
    if (req.session?.loggedIn && req.sessionID) {
      AdminSession.updateOne({ sessionId: req.sessionID }, { $set: { lastSeen: new Date() } }).catch(() => {});
    }
  } catch {}
  next();
});

// ===== WEBSITE VIEWS (device-unique, MongoDB-backed) =====
// Helper: get or create the singleton stats doc
async function getStats() {
  let doc = await SiteStats.findOne({ key: "global" });
  if (!doc) doc = await SiteStats.create({ key: "global" });
  return doc;
}

app.post("/api/website/track", async (req, res) => {
  try {
    const { deviceId } = req.body || {};
    if (!deviceId) return res.json({ success: true });

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const doc = await getStats();

    const isNewAllTime = !doc.allVisitors.includes(deviceId);
    const isNewToday   = doc.todayDate !== today || !doc.todayVisitors.includes(deviceId);

    const update = {};

    if (isNewAllTime) {
      update.$inc = { totalVisitors: 1 };
      update.$push = { allVisitors: deviceId };
    }

    if (isNewToday) {
      if (doc.todayDate !== today) {
        // New day — reset today's list
        update.$set = { todayDate: today, todayVisitors: [deviceId] };
      } else {
        update.$addToSet = { todayVisitors: deviceId };
      }
    }

    if (Object.keys(update).length) {
      await SiteStats.updateOne({ key: "global" }, update);
    }

    res.json({ success: true });
  } catch (err) {
    res.json({ success: true }); // never block the user
  }
});

app.get("/api/website/stats", isAdminApi, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const doc = await getStats();
    const todayCount = doc.todayDate === today ? doc.todayVisitors.length : 0;
    res.json({ success: true, total: doc.totalVisitors, today: todayCount });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ===== ARTICLE STATS =====
app.get("/api/articles-stats", isAdminApi, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const articles = await Article.find({}, "views likes todayViews todayLikes todayDate");
    let totalViews = 0, totalLikes = 0, todayViews = 0, todayLikes = 0;
    articles.forEach((a) => {
      totalViews += a.views || 0;
      totalLikes += a.likes || 0;
      // Sirf aaj ka data count karo
      if (a.todayDate === today) {
        todayViews += a.todayViews || 0;
        todayLikes += a.todayLikes || 0;
      }
    });
    res.json({ success: true, totalViews, totalLikes, todayViews, todayLikes });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ===== IMAGE UPLOAD =====
app.post("/api/upload", isAdminApi, uploadProvider.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Koi file nahi mili" });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "life-articles" },
        (error, r) => (error ? reject(error) : resolve(r))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== ROUTES =====
app.use("/api/admin", adminRoutes);
app.use("/api/articles", articleRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// 404 + error
app.use((req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err, req, res, next) => {
  console.error("❌", err.stack);
  res.status(500).json({ success: false, message: "Server Error!" });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
});
