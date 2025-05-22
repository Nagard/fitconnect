(async function () {
    const token = localStorage.getItem("jwt_token");
    const logoutBtn = document.getElementById("logout-btn");
    const userNameElem = document.getElementById("user-name");
    const groupList = document.getElementById("group-list");
    const groupForm = document.getElementById("create-group-form");
    const groupNameInput = document.getElementById("group-name");
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
      errorMsg.textContent = "Token ungültig.";
      return;
    }
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwt_token");
        window.location.href = "index.html";
      });
    }
  
    async function loadGroups() {
      try {
        const res = await fetch("http://localhost:8080/groups", {
          headers: { Authorization: "Bearer " + token }
        });
  
        if (!res.ok) throw new Error();
        const groups = await res.json();
        groupList.innerHTML = "";
  
        if (groups.length === 0) {
          groupList.innerHTML = "<li>Keine Gruppen gefunden.</li>";
          return;
        }
  
        groups.forEach(g => {
          const li = document.createElement("li");
          li.innerHTML = `
            <a href="group-chat.html?gid=${g.id}">
              <strong>${g.name}</strong><br/>
              <small>Erstellt von ${g.createdBy}</small>
            </a>
          `;
          groupList.appendChild(li);
        });
  
      } catch {
        errorMsg.textContent = "Fehler beim Laden der Gruppen.";
      }
    }
  
    groupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = groupNameInput.value.trim();
      if (!name) return;
  
      try {
        await fetch("http://localhost:8080/groups?name=" + encodeURIComponent(name), {
          method: "POST",
          headers: { Authorization: "Bearer " + token }
        });
        groupNameInput.value = "";
        await loadGroups();
      } catch {
        errorMsg.textContent = "Fehler beim Erstellen.";
      }
    });
  
    await loadGroups();
  })();