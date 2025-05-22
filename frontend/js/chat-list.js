(async function () {
    const token = localStorage.getItem("jwt_token");
    const logoutBtn = document.getElementById("logout-btn");
    const userNameElem = document.getElementById("user-name");
    const chatList = document.getElementById("chat-list");
    const errorMsg = document.getElementById("error-msg");
  
    function parseJwt(token) {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    }
  
    if (!token) {
      errorMsg.textContent = "Nicht eingeloggt.";
      return;
    }
  
    let username = "";
    try {
      const payload = parseJwt(token);
      username = payload.sub;
      if (userNameElem) userNameElem.textContent = username;
    } catch {
      errorMsg.textContent = "Fehler beim Token.";
      return;
    }
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwt_token");
        window.location.href = "index.html";
      });
    }
  
    try {
      const res = await fetch("http://localhost:8080/messages/overview", {
        headers: { Authorization: "Bearer " + token }
      });
  
      if (!res.ok) throw new Error();
  
      const chats = await res.json();
      if (chats.length === 0) {
        chatList.innerHTML = "<li>Keine Konversationen gefunden.</li>";
        return;
      }
  
      chats.forEach(chat => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="chat.html?with=${chat.username}">
            <strong>${chat.username}</strong><br/>
            <small>${chat.lastMessage}</small><br/>
            <span style="font-size: 0.8rem; color: #888;">
              ${new Date(chat.timestamp).toLocaleString("de-DE")}
            </span>
          </a>
        `;
        chatList.appendChild(li);
      });
  
    } catch {
      errorMsg.textContent = "Fehler beim Laden der Chatübersicht.";
    }
  })();
  