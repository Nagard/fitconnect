(async function () {
  const token = localStorage.getItem("jwt_token");
  const userNameElem = document.getElementById("user-name");
  const list = document.getElementById("activity-list");
  const stats = document.getElementById("stats");
  const addFriendBtn = document.getElementById("add-friend-btn");
  const unfriendBtn = document.getElementById("unfriend-btn");
  const friendStatus = document.getElementById("friend-status");

  const urlParams = new URLSearchParams(window.location.search);
  const targetUser = urlParams.get("user");


  const eventSource = new EventSource("http://localhost:8080/activities/feed-stream");

  eventSource.addEventListener("friend-removed", (event) => {
    const [target, by] = event.data.split("|");
    const currentUser = parseJwt(token).sub;
  
    if (target === currentUser) {
      const notice = document.createElement("div");
      notice.textContent = `🚫 ${by} hat die Freundschaft beendet.`;
      notice.style.background = "#ffdddd";
      notice.style.color = "#800";
      notice.style.padding = "1rem";
      notice.style.textAlign = "center";
      notice.style.fontWeight = "bold";
      notice.style.marginBottom = "1rem";
  
      document.body.prepend(notice);
    }
  });

  function parseJwt(token) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }



  
  if (!token) {
    userNameElem.textContent = "Nicht eingeloggt";
    return;
  }

  let currentUser = "";
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser = payload.sub;
    if (userNameElem) userNameElem.textContent = currentUser;
  } catch (err) {
    if (userNameElem) userNameElem.textContent = "";
  }

  // Freunde-Button aktualisieren
  const friendsBtn = document.getElementById("friends-btn");
  if (friendsBtn && currentUser) {
    fetch("http://localhost:8080/friends/requests", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(requests => {
        if (requests.length > 0) {
          friendsBtn.textContent = `👥 Freunde (${requests.length})`;
        }
      });

    friendsBtn.addEventListener("click", () => {
      window.location.href = "freunde.html";
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwt_token");
      window.location.href = "index.html";
    });
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
    } else if (status === "ACCEPTED") {
      unfriendBtn.style.display = "inline-block";
      unfriendBtn.addEventListener("click", async () => {
        if (!confirm(`Freundschaft mit ${viewedUser} wirklich beenden?`)) return;

        const res = await fetch(`http://localhost:8080/friends/remove/${viewedUser}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });

        if (res.ok) {
          friendStatus.textContent = "Freundschaft beendet.";
          unfriendBtn.style.display = "none";
          addFriendBtn.style.display = "inline-block";
        }
      });
    }
  }
})();
