const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); 
require("dotenv").config();

const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Connect to database
connectDB();

const database = client.db("onWayDB"); //  database name
const usersCollection = database.collection("users"); // users collection
const blogsCollection = database.collection("blogs"); // blogs collection


app.get("/api/health", (req, res) => {
  res.json({ status: "onWay Backend running " });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//  POST:  user add 
app.post("/api/users", async (req, res) => {
  try {
    const newUser = req.body;
    
    if (!newUser.email || !newUser.name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and name are required" 
      });
    }
    
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({ 
      success: true, 
      message: "User created successfully",
      data: { _id: result.insertedId, ...newUser }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// BLOGS ROUTES


app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await blogsCollection.find({}).toArray();
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Route not found" 
  });
});


// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


// Graceful Shutdown

process.on("SIGINT", async () => {
  console.log("\n⏳ Closing MongoDB connection...");
  await client.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});