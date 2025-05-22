(async function () {
  const token = localStorage.getItem("jwt_token");
  const greeting = document.getElementById("user-greeting");
  const list = document.getElementById("activity-list");
  const stats = document.getElementById("stats");
  const addFriendBtn = document.getElementById("add-friend-btn");
  const friendStatus = document.getElementById("friend-status");

  const urlParams = new URLSearchParams(window.location.search);
  const targetUser = urlParams.get("user");

  if (!token) {
    greeting.textContent = "Nicht eingeloggt.";
    return;
  }

  let currentUser = "";
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser = payload.sub;
    greeting.textContent = "👤 Eingeloggt als: " + currentUser;
  } catch (err) {
    greeting.textContent = "";
  }

  const viewedUser = targetUser || currentUser;

  // Aktivitäten laden
  try {
    const response = await fetch(viewedUser === currentUser
      ? "http://localhost:8080/activities/me/activities"
      : "http://localhost:8080/activities?user=" + viewedUser,
      {
        headers: { "Authorization": "Bearer " + token }
      });

    if (!response.ok) throw new Error("Fehler beim Laden");

    const data = await response.json();
    stats.textContent = `${viewedUser === currentUser
      ? "Du hast"
      : "Dieser Nutzer hat"} insgesamt ${data.length} Aktivitäten erfasst.`;

    list.innerHTML = "";
    data.forEach(a => {
      const li = document.createElement("li");
      li.textContent = `${a.text} (${new Date(a.timestamp).toLocaleString()})`;
      list.appendChild(li);
    });

  } catch (err) {
    stats.textContent = "Fehler beim Laden der Aktivitäten.";
  }

  // Freundschaftsstatus nur anzeigen, wenn fremdes Profil
  if (viewedUser !== currentUser) {
    const res = await fetch(`http://localhost:8080/friends/${viewedUser}/status`, {
      headers: { Authorization: "Bearer " + token }
    });
    const status = await res.text();
    friendStatus.textContent = "Beziehungsstatus: " + status;

    if (status === "NONE") {
      addFriendBtn.style.display = "inline-block";
      addFriendBtn.addEventListener("click", async () => {
        const req = await fetch(`http://localhost:8080/friends/request/${viewedUser}`, {
          method: "POST",
          headers: { Authorization: "Bearer " + token }
        });
        if (req.ok) {
          friendStatus.textContent = "Anfrage gesendet!";
          addFriendBtn.style.display = "none";
        }
      });
    }
  }
})();
