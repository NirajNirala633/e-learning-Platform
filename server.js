// dotenv configuration
require("dotenv").config();

const express = require("express");
const colors = require("colors");
const cors = require("cors");
const app = express();
const { connectDB } = require("./config/db");

// database conn.
connectDB();

// middlewares
app.use(express.json());

// routes
app.get("/", (req, res) => {
  return res.status(200).send("Welcome to E-Learning Platform");
});

app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/category", require("./routes/categoryRoutes"));
app.use("/api/v1/course", require("./routes/courseRoutes"));
app.use("/api/v1/enroll", require("./routes/enrollmentRoutes"));

// PORT
const PORT = process.env.PORT;

// LISTEN
app.listen(PORT, () => {
  console.log(`Node Server is running on ${PORT}.`.bgGreen.white);
});
