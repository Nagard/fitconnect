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
  
    let username = "";
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.sub;
      userGreeting.textContent = "👋 Willkommen, " + username;
    } catch (err) {
      userGreeting.textContent = "";
    }
  
    async function loadFeed() {
      try {
        const response = await fetch("http://localhost:8080/activities", {
          headers: { "Authorization": "Bearer " + token }
        });
  
        if (!response.ok) throw new Error("Fehler beim Laden");
  
        const activities = await response.json();
        feedList.innerHTML = "";
        activities.forEach(activity => appendToFeed(activity));
      } catch (err) {
        errorMsg.textContent = "Fehler beim Laden des Feeds.";
      }
    }
  
    function appendToFeed(activity) {
      const li = document.createElement("li");
      li.dataset.id = activity.id;
  
      li.innerHTML = `
        <span>${activity.user} – <span data-id="${activity.id}">${activity.text}</span></span>
        ${activity.user === username ? `
          <button onclick="editActivity(${activity.id})">✎</button>
          <button onclick="deleteActivity(${activity.id})">🗑️</button>
        ` : ""}
      `;
  
      // Vor dem Einfügen evtl. vorhandenes Element entfernen (kein Duplikat)
      const existing = document.querySelector(`li[data-id="${activity.id}"]`);
      if (existing) existing.remove();
  
      feedList.insertBefore(li, feedList.firstChild);
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
          body: JSON.stringify({ text })
        });
  
        if (!response.ok) {
          throw new Error("Aktivität konnte nicht erstellt werden");
        }
  
        // Jetzt mit echter ID aus DB
        const createdActivity = await response.json();
        appendToFeed(createdActivity);
  
        activityInput.value = "";
      } catch (err) {
        errorMsg.textContent = "Fehler beim Erstellen der Aktivität.";
      }
    });
  
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwt_token");
      window.location.href = "index.html";
    });
  
    window.editActivity = async function (id) {
      const newText = prompt("Neue Aktivität:");
      if (!newText) return;
  
      await fetch("http://localhost:8080/activities/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ text: newText })
      });
    };
  
    window.deleteActivity = async function (id) {
      if (!confirm("Wirklich löschen?")) return;
  
      await fetch("http://localhost:8080/activities/" + id, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });
    };
  
    loadFeed();
  
    const eventSource = new EventSource("http://localhost:8080/activities/feed-stream");
  
    eventSource.addEventListener("activity", (event) => {
      const activity = JSON.parse(event.data);
      if (activity.user !== username) {
        appendToFeed(activity);
      }
    });
  
    eventSource.addEventListener("activity-update", (event) => {
      const updated = JSON.parse(event.data);
      const span = document.querySelector(`span[data-id="${updated.id}"]`);
      if (span) {
        span.textContent = updated.text;
      }
    });
  
    eventSource.addEventListener("activity-delete", (event) => {
      const id = parseInt(event.data);
      const li = document.querySelector(`li[data-id="${id}"]`);
      if (li) li.remove();
    });
  })();
  