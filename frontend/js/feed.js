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
  
    // Nutzername aus dem Token extrahieren
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const username = payload.sub;
      userGreeting.textContent = "👋 Willkommen, " + username;
    } catch (err) {
      userGreeting.textContent = "";
    }
  
    // Feed initial laden
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
        activities.forEach(item => appendToFeed(item));
      } catch (err) {
        errorMsg.textContent = "Fehler beim Laden des Feeds.";
      }
    }
  
    // Neue Aktivität anhängen
    function appendToFeed(activity) {
      const li = document.createElement("li");
      li.textContent = `${activity.user} – ${activity.text}`;
      feedList.insertBefore(li, feedList.firstChild);
    }
  
    // Neue Aktivität posten
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
      } catch (err) {
        errorMsg.textContent = "Fehler beim Posten.";
      }
    });
  
    // Logout
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwt_token");
      window.location.href = "index.html";
    });
  
    // EventSource für Live-Updates (SSE)
    const eventSource = new EventSource("http://localhost:8080/feed-stream");
    eventSource.addEventListener("activity", (event) => {
      const activity = JSON.parse(event.data);
      appendToFeed(activity);
    });
  
    loadFeed();
  })();
  