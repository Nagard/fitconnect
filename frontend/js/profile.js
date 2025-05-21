(async function () {
    const token = localStorage.getItem("jwt_token");
    const greeting = document.getElementById("user-greeting");
    const list = document.getElementById("activity-list");
    const stats = document.getElementById("stats");
  
    if (!token) {
      greeting.textContent = "Nicht eingeloggt.";
      return;
    }
  
    let username = "";
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.sub;
      greeting.textContent = "👤 Eingeloggt als: " + username;
    } catch (err) {
      greeting.textContent = "";
    }
  
    try {
      const response = await fetch("http://localhost:8080/activities/me/activities", {
        headers: { "Authorization": "Bearer " + token }
      });
  
      if (!response.ok) throw new Error("Fehler beim Laden");
  
      const data = await response.json();
      stats.textContent = `Du hast insgesamt ${data.length} Aktivitäten erfasst.`;
  
      data.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.text} (${new Date(a.timestamp).toLocaleString()})`;
        list.appendChild(li);
      });
  
    } catch (err) {
      stats.textContent = "Fehler beim Laden deiner Aktivitäten.";
    }
  })();