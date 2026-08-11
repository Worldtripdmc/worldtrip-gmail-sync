require("dotenv").config();

const mongoose = require("mongoose");
const GmailMailbox = require("./models/GmailMailbox");

const MAILBOXES = [
  {
    email: "admin@worldtripdmc.com",
    name: "Admin",
  },
  {
    email: "avdhesh@worldtripdmc.com",
    name: "Avdhesh",
  },
  {
    email: "awaneesh@worldtripdmc.com",
    name: "Awaneesh",
  },
  {
    email: "kamakhya@worldtripdmc.com",
    name: "Kamakhya",
  },
  {
    email: "linh@worldtripdmc.com",
    name: "Linh",
  },
  {
    email: "nikita@worldtripdmc.com",
    name: "Nikita",
  },
  {
    email: "pranay@worldtripdmc.com",
    name: "Pranay",
  },
  {
    email: "querydesk@worldtripdmc.com",
    name: "Query Desk",
  },
  {
    email: "rajan@worldtripdmc.com",
    name: "Rajan",
  },
  {
    email: "rakesh@worldtripdmc.com",
    name: "Rakesh",
  },
  {
    email: "reservations@worldtripdmc.com",
    name: "Reservations",
  },
  {
    email: "ruchit@worldtripdmc.com",
    name: "Ruchit",
  },
  {
    email: "sales@theflavorexpress.com",
    name: "Flavor Express Sales",
  },
  {
    email: "sujay@worldtripdmc.com",
    name: "Sujay",
  },
  {
    email: "sumeet@worldtripdmc.com",
    name: "Sumeet",
  },
  {
    email: "worldtrip@worldtripdmc.com",
    name: "World Trip",
  },
  {
    email: "yogendra@worldtripdmc.com",
    name: "Yogendra",
  },
];

async function seedMailboxes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    let created = 0;
    let existing = 0;

    for (const mailbox of MAILBOXES) {
      const result = await GmailMailbox.updateOne(
        {
          email: mailbox.email,
        },
        {
          $setOnInsert: {
            email: mailbox.email,
            name: mailbox.name,
            status: "ACTIVE",
            syncEnabled: true,
            lastSyncAt: null,
            lastSyncStatus: "PENDING",
            lastSyncError: "",
          },
        },
        {
          upsert: true,
        }
      );

      if (result.upsertedCount === 1) {
        created++;
        console.log(`➕ Added: ${mailbox.email}`);
      } else {
        existing++;
        console.log(`⏭️ Already exists: ${mailbox.email}`);
      }
    }

    console.log("\n==================================");
    console.log("✅ Mailbox Seed Completed");
    console.log("==================================");
    console.log("➕ Created :", created);
    console.log("⏭️ Existing:", existing);
    console.log("📧 Total   :", MAILBOXES.length);
    console.log("==================================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Mailbox seed failed:", error);

    try {
      await mongoose.disconnect();
    } catch (e) {}

    process.exit(1);
  }
}

seedMailboxes();
