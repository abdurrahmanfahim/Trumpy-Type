const { MongoClient } = require("mongodb");

// Replace with your actual MongoDB connection URI
const uri = "mongodb://localhost:27017"; // If running locally
// const uri = "your-mongodb-atlas-uri"; // If using MongoDB Atlas (Cloud)

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        // Connect to the database and collection
        const db = client.db("islamic_quotes"); // Change to your database name
        const hadithCollection = db.collection("Hadiths"); // Change to your collection name

        return hadithCollection;
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}

module.exports = connectDB;
