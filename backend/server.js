const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Home route
app.get("/", (req, res) => {
  res.send("Job Aggregator API is running...");
});

// 🔥 JOB ROUTE (IMPORTANT)
app.get("/jobs", async (req, res) => {
  const { query = "developer", location = "India", skills = "" } = req.query;

  try {
    const response = await axios.post(
      `https://jooble.org/api/${process.env.JOOBLE_API_KEY}`,
      {
        keywords: query,
        location: location
      }
    );

    let jobs = response.data.jobs || [];

    jobs = jobs.map(job => ({
      title: job.title || "No Title",
      company: job.company || "Unknown",
      location: job.location || "Not specified",
      link: job.link || "#",
      score: 50
    }));

    res.json(jobs);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log("Server running...");
});