(async function () {
    const token = localStorage.getItem("jwt_token");
    const chatLog = document.getElementById("chat-log");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const groupTitle = document.getElementById("group-title");
    const memberList = document.getElementById("member-list");
    const inviteForm = document.getElementById("invite-form");
    const inviteSearch = document.getElementById("invite-search");
    const inviteResults = document.getElementById("invite-results");
    const inviteSection = document.getElementById("invite-section");
    const adminActions = document.getElementById("admin-actions");
    const deleteGroupBtn = document.getElementById("delete-group-btn");

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("gid");

    if (!token || !groupId) {
        chatLog.innerHTML = "<li>❌ Kein Token oder Gruppen-ID vorhanden.</li>";
        chatForm.style.display = "none";
        return;
    }

    const currentUser = parseJwt(token).sub;
    let isAdmin = false;

    // Admin-Status prüfen
    async function checkAdminStatus() {
        try {
            const res = await fetch(`http://localhost:8080/groups/${groupId}/is-admin`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (res.ok) {
                isAdmin = await res.json();
            }
        } catch {
            console.warn("Admin-Check fehlgeschlagen.");
        }
    }

    // Einladung & Admin-Buttons nur für Admins sichtbar
    if (inviteSection) inviteSection.style.display = "none";
    if (adminActions) adminActions.style.display = "none";

    await checkAdminStatus();
    if (isAdmin) {
        if (inviteSection) inviteSection.style.display = "block";
        if (adminActions && deleteGroupBtn) {
            adminActions.style.display = "block";
            deleteGroupBtn.addEventListener("click", async () => {
                if (!confirm("Willst du die Gruppe wirklich löschen? Diese Aktion ist endgültig.")) return;

                const res = await fetch(`http://localhost:8080/groups/${groupId}`, {
                    method: "DELETE",
                    headers: { Authorization: "Bearer " + token }
                });

                if (res.ok) {
                    alert("Gruppe wurde gelöscht.");
                    window.location.href = "group-list.html";
                } else {
                    alert("Fehler beim Löschen der Gruppe.");
                }
            });
        }
    }

    // Gruppenname anzeigen
    try {
        const res = await fetch(`http://localhost:8080/groups/${groupId}`, {
            headers: { Authorization: "Bearer " + token }
        });
        if (res.ok) {
            const group = await res.json();
            groupTitle.textContent = group.name;
        } else {
            groupTitle.textContent = `Gruppe #${groupId}`;
        }
    } catch {
        groupTitle.textContent = `Gruppe #${groupId}`;
    }

    async function loadChat() {
        const res = await fetch(`http://localhost:8080/group-messages/${groupId}`, {
            headers: { Authorization: "Bearer " + token }
        });

        if (res.status === 403) {
            chatLog.innerHTML = "<li style='color:red;'>❌ Du bist kein Mitglied dieser Gruppe.</li>";
            chatForm.style.display = "none";
            return;
        }

        const messages = await res.json();
        chatLog.innerHTML = "";
        messages.forEach(m => {
            const li = document.createElement("li");
            const me = m.sender.username === currentUser;
            li.className = me ? "chat-bubble chat-right" : "chat-bubble chat-left";
            li.innerHTML = `
                <div>${m.text}</div>
                <small>${m.sender.username} • ${new Date(m.timestamp).toLocaleString("de-DE")}</small>
            `;
            chatLog.appendChild(li);
        });

        chatLog.scrollTop = chatLog.scrollHeight;
    }

    async function loadMembers() {
        const res = await fetch(`http://localhost:8080/groups/${groupId}/members`, {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) return;

        const users = await res.json();
        memberList.innerHTML = "";

        users.forEach(u => {
            const li = document.createElement("li");
            li.textContent = u.username;

            // Entfernen-Button nur für Admins und nicht bei sich selbst
            if (isAdmin && u.username !== currentUser) {
                const removeBtn = document.createElement("button");
                removeBtn.textContent = "❌ Entfernen";
                removeBtn.style.marginLeft = "1rem";
                removeBtn.addEventListener("click", async () => {
                    if (!confirm(`${u.username} wirklich aus der Gruppe entfernen?`)) return;

                    const res = await fetch(
                        `http://localhost:8080/groups/${groupId}/members/${u.username}`,
                        {
                            method: "DELETE",
                            headers: { Authorization: "Bearer " + token }
                        }
                    );

                    if (res.ok) {
                        await loadMembers();
                    }
                });

                li.appendChild(removeBtn);
            }

            memberList.appendChild(li);
        });
    }

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        await fetch(`http://localhost:8080/group-messages/${groupId}?text=${encodeURIComponent(text)}`, {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });

        chatInput.value = "";
        await loadChat();
    });

    inviteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = inviteSearch.value.trim();
        if (!query) return;

        const res = await fetch("http://localhost:8080/users/search?query=" + encodeURIComponent(query), {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) return;

        const users = await res.json();
        inviteResults.innerHTML = "";

        users.forEach(u => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${u.username}
                <button data-user="${u.username}">➕ Einladen</button>
            `;
            inviteResults.appendChild(li);
        });

        inviteResults.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", async () => {
                const friendUsername = btn.dataset.user;

                const inviteRes = await fetch(
                    `http://localhost:8080/groups/${groupId}/invite?friendUsername=${friendUsername}`,
                    {
                        method: "POST",
                        headers: { Authorization: "Bearer " + token }
                    }
                );

                if (inviteRes.ok) {
                    btn.disabled = true;
                    btn.textContent = "✅ Eingeladen";
                    await loadMembers();
                }
            });
        });
    });

    const eventSource = new EventSource("http://localhost:8080/activities/feed-stream");
    eventSource.addEventListener("group-message-" + groupId, () => {
        loadChat();
    });

    function parseJwt(token) {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    }

    await loadChat();
    await loadMembers();
})();
