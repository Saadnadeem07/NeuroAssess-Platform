/**
 * Seeds the first admin account (admins are not publicly registerable).
 *
 *   npm run seed:admin
 *
 * Override via env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fall back to .env

import mongoose from "mongoose";
import Admin from "../src/models/Admin";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || "admin@neuroassess.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Platform Admin";

  await mongoose.connect(uri);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`✅ Admin already exists: ${email}`);
    await mongoose.connection.close();
    return;
  }

  await Admin.create({
    name,
    email,
    password,
    emailVerified: true,
    isTemporary: false,
    permissions: ["super_admin"],
    adminLevel: "super",
  });

  console.log("✅ Admin created:");
  console.log(`   email:    ${email}`);
  console.log(`   password: ${password}`);
  console.log("   → log in at /admin/login");

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
