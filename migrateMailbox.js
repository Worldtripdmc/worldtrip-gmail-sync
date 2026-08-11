require("dotenv").config();

const mongoose = require("mongoose");
const Email = require("./models/Email");

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    const result = await Email.updateMany(
      {
        mailbox: {
          $exists: false,
        },
      },
      {
        $set: {
          mailbox: "avdhesh@worldtripdmc.com",
        },
      }
    );

    console.log("Matched:", result.matchedCount);
    console.log("Updated:", result.modifiedCount);

    await mongoose.disconnect();

    console.log("✅ Migration completed");
  } catch (error) {
    console.error("❌ Migration failed:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

migrate();
