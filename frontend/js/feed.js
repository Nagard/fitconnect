(async function () {
  const token = localStorage.getItem("jwt_token");
  const errorMsg = document.getElementById("error-msg");
  const feedList = document.getElementById("feed-list");
  const logoutBtn = document.getElementById("logout-btn");
  const activityForm = document.getElementById("activity-form");
  const activityInput = document.getElementById("activity-input");
  const userGreeting = document.getElementById("user-greeting");

  if (!token) {
    errorMsg.textContent = "Nicht eingeloggt. Bitte zuerst anmelden.";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const username = payload.sub;
    userGreeting.textContent = "👋 Willkommen, " + username;
  } catch (err) {
    userGreeting.textContent = "";
  }

  async function loadFeed() {
    try {
      const response = await fetch("http://localhost:8080/feed", {
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok) {
        throw new Error("Feed konnte nicht geladen werden");
      }

      const activities = await response.json();
      feedList.innerHTML = "";
      activities.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.user} – ${item.text}`;
        feedList.appendChild(li);
      });
    } catch (err) {
      errorMsg.textContent = "Fehler beim Laden des Feeds.";
    }
  }

  activityForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const text = activityInput.value.trim();
    if (!text) return;

    try {
      const response = await fetch("http://localhost:8080/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ text: text })
      });

      if (!response.ok) {
        throw new Error("Aktivität konnte nicht gepostet werden");
      }

      activityInput.value = "";
      await loadFeed();
    } catch (err) {
      errorMsg.textContent = "Fehler beim Posten.";
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jwt_token");
    window.location.href = "index.html";
  });

  loadFeed();
})();
