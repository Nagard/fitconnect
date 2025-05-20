(async function () {
    const token = localStorage.getItem("jwt_token");
    const errorMsg = document.getElementById("error-msg");
    const feedList = document.getElementById("feed-list");
    const logoutBtn = document.getElementById("logout-btn");
  
    if (!token) {
      errorMsg.textContent = "Nicht eingeloggt. Bitte zuerst anmelden.";
      return;
    }
  
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
      activities.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.user} – ${item.activity}`;
        feedList.appendChild(li);
      });
    } catch (err) {
      errorMsg.textContent = "Fehler beim Laden des Feeds.";
    }
  
    // Logout-Logik
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwt_token");
      window.location.href = "index.html";
    });
  })();