function selectMood(score) {
  document.getElementById("selectedMood").innerText = "Mood Score: " + score;
}

function analyzeSentiment() {
  const text = document.getElementById("journalText").value.toLowerCase();
  let score = 0;
  if (text.includes("happy") || text.includes("grateful")) score += 0.5;
  if (text.includes("sad") || text.includes("stressed")) score -= 0.5;
  document.getElementById("sentimentResult").innerText = "Sentiment: " + score.toFixed(1);
}

document.getElementById("predictForm")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const mood = parseFloat(this.mood.value);
  const sentiment = parseFloat(this.sentiment.value);
  const usage = parseInt(this.usage.value);

  fetch("https://mindmate-api-1.onrender.com/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ mood, sentiment, usage })
})

  .then(res => res.json())
  .then(data => {
    document.getElementById("result").innerText = "🧘 Result: " + data.stress_level;
  })
  .catch(() => {
    document.getElementById("result").innerText = "⚠️ Error contacting server";
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("predictForm");
  const resultEl = document.getElementById("result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop the form from reloading the page

    const mood = parseFloat(form.mood.value);
    const sentiment = parseFloat(form.sentiment.value);
    const usage = parseInt(form.usage.value);

    try {
      const response = await fetch("http://192.168.100.9:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, sentiment, usage })
      });

      const data = await response.json();
      resultEl.innerText = `🧘 Result: ${data.stress_level}`;
    } catch (error) {
      resultEl.innerText = "🚨 Something went wrong. Try again!";
    }
  });
});
