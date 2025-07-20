function selectMood(score) {
  const display = document.getElementById("selectedMood");
  if (display) display.innerText = "Mood Score: " + score;
}

function analyzeSentiment() {
  const text = document.getElementById("journalText")?.value?.toLowerCase() || "";
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
  const content = history.map((h, i) =>
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

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      resultEl.innerText = "";
      resultEl.className = "result";
      loader.style.display = "block";

      const moodInput = document.getElementById("mood");
      const sentimentInput = document.getElementById("sentiment");
      const usageInput = document.getElementById("usage");

      if (!moodInput || !sentimentInput || !usageInput) {
        loader.style.display = "none";
        resultEl.innerText = "⚠️ One or more inputs missing.";
        return;
      }

      const mood = parseFloat(moodInput.value);
      const sentiment = parseFloat(sentimentInput.value);
      const usage = parseInt(usageInput.value);

      console.log("Sending to backend:", { mood, sentiment, usage });

      if (isNaN(mood) || isNaN(sentiment) || isNaN(usage)) {
        loader.style.display = "none";
        resultEl.innerText = "⚠️ Please enter valid numbers.";
        return;
      }

      try {
        const response = await fetch("https://mindmate-api-7reu.onrender.com/predict", {

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
        resultEl.innerText = "🚨 Error contacting server.";
        resultEl.className = "result error";
      }
    });
  }
});
