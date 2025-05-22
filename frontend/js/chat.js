(async function () {
    const token = localStorage.getItem("jwt_token");
    const logoutBtn = document.getElementById("logout-btn");
    const chatLog = document.getElementById("chat-log");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatPartnerElem = document.getElementById("chat-partner");
  
    const urlParams = new URLSearchParams(window.location.search);
    const withUser = urlParams.get("with");
  




    
    if (!token || !withUser) {
      chatLog.innerHTML = "<li>Fehler: Kein Nutzer angegeben oder nicht eingeloggt.</li>";
      return;
    }
  
    chatPartnerElem.textContent = withUser;
  
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwt_token");
      window.location.href = "index.html";
    });
  
    async function loadChat() {
      const res = await fetch(`http://localhost:8080/messages/${withUser}`, {
        headers: { Authorization: "Bearer " + token }
      });
  
      if (res.status === 403) {
        chatLog.innerHTML = "<li style='color: red;'>❌ Du bist mit diesem Nutzer nicht (mehr) befreundet.<br/>Chat nicht verfügbar.</li>";
        chatForm.style.display = "none";
        return;
      }
      
      if (!res.ok) {
        chatLog.innerHTML = "<li>Unbekannter Fehler beim Laden des Verlaufs.</li>";
        return;
      }
  
      const messages = await res.json();
      chatLog.innerHTML = "";
      messages.forEach(m => {
        const li = document.createElement("li");
        const me = parseJwt(token).sub === m.sender.username;
        li.className = me ? "chat-bubble chat-right" : "chat-bubble chat-left";
      
        li.innerHTML = `
        <div>${m.text}</div>
        <small>${new Date(m.timestamp).toLocaleString('de-DE')}</small>
      `;
      
      chatLog.appendChild(li);
      });
  
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
  
      await fetch("http://localhost:8080/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ recipient: withUser, text })
      });
  
      chatInput.value = "";
      await loadChat();
    });
  
    function parseJwt(token) {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    }
  
    await loadChat();



    const eventSource = new EventSource("http://localhost:8080/activities/feed-stream");

    eventSource.addEventListener("new-message", (event) => {
      const [recipient, sender] = event.data.split("|");
    
      const currentUser = parseJwt(token).sub;
      const chatPartner = new URLSearchParams(window.location.search).get("with");
    
      const isRelevant = (recipient === currentUser && sender === chatPartner);
      if (isRelevant) {
        loadChat(); // Neues anzeigen
      }
    });


    

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

  })();
  