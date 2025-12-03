const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router')
app.use('/auth', authRouter)
const storeRouter = require('./routes/store-router')
app.use('/api/store', storeRouter)

// INITIALIZE OUR DATABASE OBJECT
const MongoDatabaseManager = require('./db/mongodb/index');
const dbManager = new MongoDatabaseManager();

// Connect to database before starting server
async function startServer() {
  try {
    await dbManager.connect();
    console.log('MongoDB connected successfully');
    
    // PUT THE SERVER IN LISTENING MODE
    app.listen(PORT, () => console.log(`Playlister Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit if database connection fails
  }
}

startServer();

