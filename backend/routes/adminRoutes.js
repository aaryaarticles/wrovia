const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const AdminSession = require("../models/AdminSession");

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "";
}

function parseDevice(ua = "") {
  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  return `${browser} on ${os}`;
}

function isAdminApi(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.status(401).json({ success: false, message: "Unauthorized! Pehle login karo." });
}

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username aur password chahiye." });
    }
    const admin = await Admin.findOne({ username: username.trim() });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials!" });
    const ok = await admin.verifyPassword(password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials!" });

    req.session.loggedIn = true;
    req.session.adminId = String(admin._id);
    req.session.username = admin.username;

    // Track this session/device
    const ip = getClientIp(req);
    const ua = req.headers["user-agent"] || "";
    await AdminSession.findOneAndUpdate(
      { sessionId: req.sessionID },
      { sessionId: req.sessionID, ip, userAgent: ua, deviceLabel: parseDevice(ua), lastSeen: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Login successful!", username: admin.username });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== LOGOUT (current session) =====
router.post("/logout", async (req, res) => {
  try {
    if (req.sessionID) {
      await AdminSession.deleteOne({ sessionId: req.sessionID }).catch(() => {});
    }
    req.session.destroy(() => res.json({ success: true }));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== CHECK =====
router.get("/check", (req, res) => {
  res.json({
    loggedIn: !!(req.session && req.session.loggedIn),
    username: req.session?.username || null,
  });
});

// ===== ACTIVE SESSIONS (with IPs) =====
router.get("/sessions", isAdminApi, async (req, res) => {
  try {
    const list = await AdminSession.find().sort({ lastSeen: -1 }).lean();
    res.json({
      success: true,
      currentSessionId: req.sessionID,
      sessions: list.map((s) => ({
        sessionId: s.sessionId,
        ip: s.ip,
        device: s.deviceLabel,
        userAgent: s.userAgent,
        lastSeen: s.lastSeen,
        isCurrent: s.sessionId === req.sessionID,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== REVOKE a remote session (logout that device) =====
router.post("/sessions/revoke", isAdminApi, async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ success: false, message: "sessionId required" });
    if (sessionId === req.sessionID) {
      return res.status(400).json({ success: false, message: "Current session ko yahan se logout nahi kar sakte. Logout button use karo." });
    }
    // Delete the express-session document directly from sessions collection
    const mongoose = require("mongoose");
    const sessionsCol = mongoose.connection.collection("sessions");
    await sessionsCol.deleteOne({ _id: sessionId }).catch(() => {});
    await AdminSession.deleteOne({ sessionId });
    res.json({ success: true, message: "Device logged out." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== CHANGE PASSWORD =====
router.post("/change-password", isAdminApi, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Dono fields chahiye." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Naya password kam se kam 6 chars ka ho." });
    }
    const admin = await Admin.findById(req.session.adminId);
    if (!admin) return res.status(401).json({ success: false, message: "Admin nahi mila." });
    const ok = await admin.verifyPassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: "Current password galat hai." });
    await admin.setPassword(newPassword);
    await admin.save();
    res.json({ success: true, message: "Password update ho gaya. Doosre devices ko logout karna mat bhulna." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
