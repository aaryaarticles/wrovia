// One-time admin seeder. Run: `npm run seed:admin`
// Naya admin tabhi banega jab DB me koi admin nahi hai.
require("dotenv").config();
const readline = require("readline");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

function ask(q, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (hidden) {
      process.stdout.write(q);
      process.stdin.on("data", (d) => {});
      rl.question("", (a) => { rl.close(); resolve(a); });
    } else {
      rl.question(q, (a) => { rl.close(); resolve(a); });
    }
  });
}

(async () => {
  try {
    await connectDB();
    const existing = await Admin.findOne();
    if (existing) {
      console.log(`\n⚠️  Admin pehle se exist karta hai (username: ${existing.username}).`);
      console.log("Naya admin create nahi kiya ja sakta. Password change karne ke liye admin panel > Settings use karo.\n");
      process.exit(0);
    }
    const username = (await ask("Naya admin username: ")).trim();
    const password = (await ask("Naya admin password: ")).trim();
    if (!username || password.length < 6) {
      console.log("❌ Username chahiye aur password kam se kam 6 chars ka ho.");
      process.exit(1);
    }
    const admin = new Admin({ username });
    await admin.setPassword(password);
    await admin.save();
    console.log(`\n✅ Admin "${username}" create ho gaya. Ab login kar sakte ho.\n`);
    process.exit(0);
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();
