(async function () {
  const token = localStorage.getItem("jwt_token");
  const userNameElem = document.getElementById("user-name");
  const friendsList = document.getElementById("friends-list");
  const requestsList = document.getElementById("requests-list");


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
    if (userNameElem) userNameElem.textContent = "Nicht eingeloggt.";
    return;
  }

  let username = "";
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    username = payload.sub;
    if (userNameElem) userNameElem.textContent = username;
  } catch (err) {
    if (userNameElem) userNameElem.textContent = "";
  }

  // Freunde-Button aktualisieren
  const friendsBtn = document.getElementById("friends-btn");
  if (friendsBtn && username) {
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

  async function loadFriends() {
    const res = await fetch("http://localhost:8080/friends", {
      headers: { Authorization: "Bearer " + token }
    });
    const users = await res.json();
    friendsList.innerHTML = "";
    users.forEach(user => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="profile.html?user=${user.username}">${user.username}</a>
        <button onclick="startChat('${user.username}')">💬</button>
        <button onclick="unfriend('${user.username}')">❌</button>
      `;
      friendsList.appendChild(li);
    });
  }

  async function loadRequests() {
    const res = await fetch("http://localhost:8080/friends/requests", {
      headers: { Authorization: "Bearer " + token }
    });
    const requests = await res.json();
    requestsList.innerHTML = "";
    requests.forEach(req => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="profile.html?user=${req.requester.username}">${req.requester.username}</a>
        <button onclick="respond(${req.id}, true)">✔️</button>
        <button onclick="respond(${req.id}, false)">❌</button>
      `;
      requestsList.appendChild(li);
    });
  }

  window.respond = async function (id, accept) {
    await fetch("http://localhost:8080/friends/respond/" + id + "?accept=" + accept, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    });
    await loadFriends();
    await loadRequests();
  };

  window.unfriend = async function (username) {
    if (!confirm(`Freundschaft mit ${username} wirklich beenden?`)) return;

    await fetch(`http://localhost:8080/friends/remove/${username}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    await loadFriends();
    await loadRequests();
  };

  window.startChat = function (username) {
    window.location.href = `chat.html?with=${username}`;
  };

  await loadFriends();
  await loadRequests();
})();
