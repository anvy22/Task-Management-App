import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name";

async function clearDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Get all collections
        const collections = await mongoose.connection.db?.collections();

        if (!collections || collections.length === 0) {
            console.log("ℹ️  No collections found in database");
            return;
        }

        console.log(`\n📋 Found ${collections.length} collection(s):`);
        collections.forEach((collection) => {
            console.log(`   - ${collection.collectionName}`);
        });

        // Drop all collections
        console.log("\n🗑️  Clearing all collections...\n");

        for (const collection of collections) {
            const count = await collection.countDocuments();
            await collection.deleteMany({});
            console.log(`✅ Cleared ${collection.collectionName} (${count} documents deleted)`);
        }

        console.log("\n✨ Database cleared successfully!");
    } catch (error) {
        console.error("❌ Error clearing database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
    }
}

// Alternative: Drop entire database (more aggressive)
async function dropDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const dbName = mongoose.connection.db?.databaseName;
        console.log(`\n⚠️  WARNING: About to drop entire database: ${dbName}`);

        await mongoose.connection.db?.dropDatabase();

        console.log(`\n✨ Database "${dbName}" dropped successfully!`);
    } catch (error) {
        console.error("❌ Error dropping database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
    }
}

// Show database stats before clearing
async function showDatabaseStats() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const collections = await mongoose.connection.db?.collections();

        if (!collections || collections.length === 0) {
            console.log("ℹ️  No collections found");
            return;
        }

        console.log("\n📊 Database Statistics:\n");

        for (const collection of collections) {
            const count = await collection.countDocuments();
            console.log(`   ${collection.collectionName}: ${count} documents`);
        }
    } catch (error) {
        console.error("❌ Error reading database:", error);
    } finally {
        await mongoose.disconnect();
    }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case "clear":
        clearDatabase();
        break;
    case "drop":
        dropDatabase();
        break;
    case "stats":
        showDatabaseStats();
        break;
    default:
        console.log(`
🗄️  MongoDB Database Management Script

Usage:
  bun run src/scripts/clearDatabase.ts [command]

Commands:
  clear   - Delete all documents from all collections (keeps structure)
  drop    - Drop the entire database (destructive)
  stats   - Show database statistics

Examples:
  bun run src/scripts/clearDatabase.ts clear
  bun run src/scripts/clearDatabase.ts drop
  bun run src/scripts/clearDatabase.ts stats
        `);
}
