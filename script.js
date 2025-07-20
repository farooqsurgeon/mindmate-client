function selectMood(score) {
  const display = document.getElementById("selectedMood");
  if (display) display.innerText = "Mood Score: " + score;
}

function analyzeSentiment() {
  const text = document.getElementById("journalText")?.value.toLowerCase() || "";
  let score = 0;
  if (text.includes("happy") || text.includes("grateful")) score += 0.5;
  if (text.includes("sad") || text.includes("stressed")) score -= 0.5;

  const sentimentEl = document.getElementById("sentimentResult");
  if (sentimentEl) sentimentEl.innerText = "Sentiment: " + score.toFixed(1);

  const history = JSON.parse(localStorage.getItem("journalHistory") || "[]");
  history.push({
    entry: text,
    sentiment: score.toFixed(1),
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem("journalHistory", JSON.stringify(history));
  displayJournalHistory();
}

function displayJournalHistory() {
  const container = document.getElementById("journalHistory");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("journalHistory") || "[]");
  container.innerHTML = history.map(item => `
    <div>
      <strong>${item.date}</strong><br/>
      Sentiment: ${item.sentiment}<br/>
      <em>"${item.entry}"</em>
    </div><hr/>
  `).join("");
}

function exportJournal() {
  const history = JSON.parse(localStorage.getItem("journalHistory") || "[]");
  let content = history.map((h, i) =>
    `${i + 1}) Date: ${h.date}\nSentiment: ${h.sentiment}\n${h.entry}\n`
  ).join("\n---\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "MindMate_Journal.txt";
  a.click();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("predictForm");
  const resultEl = document.getElementById("result");
  const loader = document.getElementById("loader");

  if (document.getElementById("journalHistory")) {
    displayJournalHistory();
  }

  if (form && resultEl && loader) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      resultEl.innerText = "";
      resultEl.className = "result";
      loader.style.display = "block";

      const mood = parseFloat(document.getElementById("mood")?.value || 0);
      const sentiment = parseFloat(document.getElementById("sentiment")?.value || 0);
      const usage = parseInt(document.getElementById("usage")?.value || 0);

      console.log("Sending:", { mood, sentiment, usage });

      try {
        const response = await fetch("https://mindmate-api-1.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, sentiment, usage })
        });

        const data = await response.json();
        loader.style.display = "none";

        const stressLevel = data?.stress_level || "Unknown";
        const level = stressLevel.toLowerCase();
        const emoji = level === "low" ? "🟢" :
                      level === "moderate" ? "🟡" :
                      level === "high" ? "🔴" : "⚪";

        resultEl.innerText = `🧘 ${stressLevel} Stress ${emoji}`;
        resultEl.className = `result ${level}`;
      } catch (error) {
        loader.style.display = "none";
        console.error("Fetch error:", error);
        resultEl.innerText = "🚨 Something went wrong. Try again!";
        resultEl.className = "result error";
      }
    });
  }
});
