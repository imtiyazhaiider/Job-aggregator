async function searchJobs() {
  const query = document.getElementById("search").value;
  const skills = document.getElementById("skills").value;
  const location = document.getElementById("location").value;

  const results = document.getElementById("results");
  const loading = document.getElementById("loading");

  results.innerHTML = "";
  loading.style.display = "block";

  try {
    const res = await fetch(
      `http://localhost:5000/jobs?query=${query}&skills=${skills}&location=${location}`
    );

    const jobs = await res.json();
    loading.style.display = "none";

    if (jobs.length === 0) {
      results.innerHTML = "<p>No matching jobs found.</p>";
      return;
    }

    jobs.forEach(job => {
      const div = document.createElement("div");
      div.className = "job-card";

      div.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>${job.company}</strong></p>
        <p>${job.location}</p>
        <p>Match Score: ${job.score}</p>
        <a href="${job.link}" target="_blank" class="apply-btn">Apply</a>
      `;

      results.appendChild(div);
    });

  } catch (err) {
    loading.style.display = "none";
    results.innerHTML = "<p>Error fetching jobs.</p>";
  }
}