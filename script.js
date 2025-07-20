function selectMood(score) {
  document.getElementById("selectedMood").innerText = "Mood Score: " + score;
}

function analyzeSentiment() {
  const text = document.getElementById("journalText").value.toLowerCase();
  let score = 0;
  if (text.includes("happy") || text.includes("grateful")) score += 0.5;
  if (text.includes("sad") || text.includes("stressed")) score -= 0.5;

  document.getElementById("sentimentResult").innerText = "Sentiment: " + score.toFixed(1);

  const history = JSON.parse(localStorage.getItem("journalHistory") || "[]");
  history.push({ entry: text, sentiment: score.toFixed(1) });
  localStorage.setItem("journalHistory", JSON.stringify(history));
  displayJournalHistory();
}

function displayJournalHistory() {
  const history = JSON.parse(localStorage.getItem("journalHistory") || "[]");
  const container = document.getElementById("journalHistory");
  container.innerHTML = history.map(item => `
    <div><strong>Sentiment:</strong> ${item.sentiment}<br/>"${item.entry}"</div><hr/>
  `).join("");
}

function exportJournal() {
  const history = JSON.parse(localStorage.getItem("journalHistory") || "[]");
  let content = history.map((h, i) => `${i + 1}) [Sentiment: ${h.sentiment}]\n${h.entry}\n`).join("\n---\n");
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
      loader.style.display = "block";

      const mood = parseFloat(form.mood.value);
      const sentiment = parseFloat(form.sentiment.value);
      const usage = parseInt(form.usage.value);

      try {
        const response = await fetch("https://mindmate-api-1.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, sentiment, usage })
        });

        const data = await response.json();
        loader.style.display = "none";

        const level = data.stress_level.toLowerCase();
        resultEl.innerText = `🧘 Result: ${data.stress_level}`;
        resultEl.className = `result ${level}`;

      } catch (error) {
        loader.style.display = "none";
        resultEl.innerText = "🚨 Something went wrong. Try again!";
        resultEl.className = "result";
      }
    });
  }
});
