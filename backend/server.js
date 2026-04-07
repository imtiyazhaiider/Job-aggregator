const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Home route
app.get("/", (req, res) => {
  res.send("Job Aggregator API is running...");
});

// 🔥 SMART JOB FETCHING + SCORING
app.get("/jobs", async (req, res) => {
  const {
    query = "developer",
    location = "India",
    skills = ""
  } = req.query;

  const skillList = skills
    .toLowerCase()
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  try {
    const response = await axios.post(
      `https://jooble.org/api/${process.env.JOOBLE_API_KEY}`,
      {
        keywords: query,
        location: location
      }
    );

    let jobs = response.data.jobs || [];

    // 🔹 Score jobs based on skills + title match
    jobs = jobs.map(job => {
      let score = 0;

      const title = (job.title || "").toLowerCase();
      const company = (job.company || "").toLowerCase();

      // Title match
      if (title.includes(query.toLowerCase())) {
        score += 50;
      }

      // Skills match
      skillList.forEach(skill => {
        if (title.includes(skill)) {
          score += 20;
        }
      });

      return {
        title: job.title || "No Title",
        company: job.company || "Unknown",
        location: job.location || "Not specified",
        link: job.link || "#",
        score
      };
    });

    // 🔹 Remove low quality jobs
    jobs = jobs.filter(job => job.score > 30);

    // 🔹 Remove duplicates
    const seen = new Set();
    jobs = jobs.filter(job => {
      const key = job.title + job.company;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 🔹 Sort by score (BEST FIRST 🔥)
    jobs.sort((a, b) => b.score - a.score);

    // 🔹 Limit results
    jobs = jobs.slice(0, 20);

    res.json(jobs);

  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});