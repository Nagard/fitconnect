(async function () {
    const token = localStorage.getItem("jwt_token");
    const userGreeting = document.getElementById("user-greeting");
    const friendsList = document.getElementById("friends-list");
    const requestsList = document.getElementById("requests-list");
  
    if (!token) {
      userGreeting.textContent = "Nicht eingeloggt.";
      return;
    }
  
    let username = "";
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.sub;
      userGreeting.textContent = "👤 Eingeloggt als: " + username;
    } catch (err) {
      userGreeting.textContent = "";
    }
  
    async function loadFriends() {
      const res = await fetch("http://localhost:8080/friends", {
        headers: { Authorization: "Bearer " + token }
      });
      const users = await res.json();
      friendsList.innerHTML = "";
      users.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="profile.html?user=${user.username}">${user.username}</a>`;
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
  
    await loadFriends();
    await loadRequests();
  })();
  