(async function () {
  const token = localStorage.getItem("jwt_token");

  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  const errorMsg = document.getElementById("error-msg");
  const feedList = document.getElementById("feed-list");
  const logoutBtn = document.getElementById("logout-btn");
  const activityForm = document.getElementById("activity-form");
  const activityInput = document.getElementById("activity-input");
  const activityLocation = document.getElementById("activity-location");
  const userGreeting = document.getElementById("user-greeting");

  // Prüfen, ob ein Token vorhanden ist
  if (!token) {
    errorMsg.textContent = "Nicht eingeloggt. Bitte zuerst anmelden.";
    return;
  }

  // Username aus dem JWT-Token herauslesen
  let username = "";
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  username = payload.sub;
  document.getElementById("user-name").textContent = username;
} catch (err) {
  userGreeting.textContent = "";
}

// Freunde-Button separat danach initialisieren
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

  

  // Map initialisieren
  mapboxgl.accessToken = "pk.eyJ1IjoibmFnYXJkIiwiYSI6ImNtYXhvcmx5MjAwanMyd3F1MGF0c2FpbHAifQ.y41D8qaCugwI3rVrNV0AJQ";
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [8.63899, 49.64309], // z. B. Darmstadt
    zoom: 11
  });

  let currentMarker = null;
  const activityMarkers = new Map();
  const deletedIds = new Set();

  // Klick-Event auf der Karte => Marker setzen + Location ins Input
  map.on('click', function (e) {
    const { lng, lat } = e.lngLat;
    if (currentMarker) currentMarker.remove();
    currentMarker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Ort ausgewählt"))
      .addTo(map);
    activityLocation.value = `${lng.toFixed(5)},${lat.toFixed(5)}`;
  });

  // Marker auf die Karte bringen, falls Location vorhanden
  function addMarkerIfLocationExists(activity) {
    // Falls bereits "gelöscht" markiert, ignorieren
    if (deletedIds.has(activity.id)) {
      console.log("⚪ Marker unterdrückt für gelöschte ID:", activity.id);
      return;
    }

    if (activity.location) {
      const [lng, lat] = activity.location.split(',').map(Number);

      // Einen evtl. vorhandenen Marker für dieselbe ID entfernen
      if (activityMarkers.has(activity.id)) {
        activityMarkers.get(activity.id).remove();
      }

      // Popup-Info definieren
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '200px' })
        .setHTML(`
          <strong>${activity.user}</strong><br/>
          ${activity.text}<br/>
          <small>${new Date(activity.timestamp).toLocaleString('de-DE')}</small>
        `);

      // Neuen Marker erstellen
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      // Hover-Effekt, damit das Popup beim Drüberfahren erscheint
      marker.getElement().dataset.markerId = activity.id;
      marker.getElement().addEventListener('mouseenter', () => popup.addTo(map));
      marker.getElement().addEventListener('mouseleave', () => popup.remove());

      // In der Map speichern
      activityMarkers.set(activity.id, marker);
      console.log("📍 Marker gesetzt für ID:", activity.id);
    }
  }

  // Feed vom Server holen und listen
  async function loadFeed() {
    try {
      const response = await fetch("http://localhost:8080/activities", {
        headers: { Authorization: "Bearer " + token }
      });
      if (!response.ok) throw new Error("Fehler beim Laden");

      const activities = await response.json();
      feedList.innerHTML = "";
      // Vorherige Marker entfernen
      activityMarkers.forEach(marker => marker.remove());
      activityMarkers.clear();
      deletedIds.clear();

      // Jeden Eintrag anfügen
      activities.forEach(activity => {
        appendToFeed(activity);
        addMarkerIfLocationExists(activity);
      });
    } catch (err) {
      errorMsg.textContent = "Fehler beim Laden des Feeds.";
    }
  }

  // Eine einzelne Aktivität in die Feed-Liste einfügen
  function appendToFeed(activity) {
    const li = document.createElement("li");
    li.dataset.id = activity.id;

    // Icon je nach Sichtbarkeit
    const visibilityIcon = {
      PUBLIC: "🔓 Öffentlich",
      FRIENDS_ONLY: "🫂 Nur Freunde",
      PRIVATE: "🔒 Privat"
    }[activity.visibility || "PUBLIC"];

    li.innerHTML = `
      <span>
        <a href="profile.html?user=${activity.user}">${activity.user}</a> – <span data-id="${activity.id}">${activity.text}</span><br/>
        <small style="color: #666;">${visibilityIcon}</small>
      </span>
      ${
        activity.user?.toLowerCase?.() === username?.toLowerCase?.()
          ? `
            <button onclick="editActivity(${activity.id})">✎</button>
            <button onclick="deleteActivity(${activity.id})">🗑️</button>
          `
          : ""
      }
    `;

    // Etwaige Duplikate vorher entfernen
    const existing = document.querySelector(`li[data-id="${activity.id}"]`);
    if (existing) existing.remove();

    // Ganz oben einfügen
    feedList.insertBefore(li, feedList.firstChild);
  }

  // Formular zum Posten einer neuen Aktivität
  activityForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const text = activityInput.value.trim();
    const location = activityLocation.value.trim();
    if (!text) return;

    const visibility = document.getElementById("activity-visibility").value;

    const response = await fetch("http://localhost:8080/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ text, location, visibility })
    });

    if (!response.ok) return;
    const createdActivity = await response.json();
    appendToFeed(createdActivity);
    addMarkerIfLocationExists(createdActivity);
    activityInput.value = "";
    activityLocation.value = "";
  });

  // Logout-Button
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jwt_token");
    window.location.href = "index.html";
  });

  // Bearbeiten einer Aktivität
  window.editActivity = async function (id) {
    const newText = prompt("Neue Aktivität:");
    if (!newText) return;

    let location = null;
    // Wenn für diese ID ein Marker existiert, nimm dessen Koordinaten
    if (activityMarkers.has(id)) {
      const lngLat = activityMarkers.get(id).getLngLat();
      location = `${lngLat.lng.toFixed(5)},${lngLat.lat.toFixed(5)}`;
    }

    await fetch("http://localhost:8080/activities/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ text: newText, location })
    });

    // Keine direkte Aktualisierung hier, da es per SSE geschieht (activity-update)
  };

  // Löschen einer Aktivität
  window.deleteActivity = async function (id) {
    if (!confirm("Wirklich löschen?")) return;
  
    const response = await fetch("http://localhost:8080/activities/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
  
    if (response.ok) {
      // **Sofort** den Eintrag im Feed entfernen
      const li = document.querySelector(`li[data-id="${id}"]`);
      if (li) li.remove();
  
      // ... und gleich den Marker entfernen
      if (activityMarkers.has(id)) {
        const marker = activityMarkers.get(id);
        marker.remove();
        marker.setPopup(null);
        const el = marker.getElement();
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
        activityMarkers.delete(id);
      }
      if (currentMarker) {
        currentMarker.remove();
        currentMarker = null;
      }
      console.log("🗑️ DELETE erfolgreich – warte zusätzlich auf SSE für die anderen.");
    }
  };

  // Feed beim Start laden
  loadFeed();

  // SSE-Verbindung aufbauen
  const eventSource = new EventSource("http://localhost:8080/activities/feed-stream");

  // Neue Aktivität kommt rein
  eventSource.addEventListener("activity", (event) => {
    const activity = JSON.parse(event.data);
    appendToFeed(activity);
    addMarkerIfLocationExists(activity);
  });

  // Aktivität wurde bearbeitet
  eventSource.addEventListener("activity-update", (event) => {
    const updated = JSON.parse(event.data);

    // Text im Feed austauschen
    const span = document.querySelector(`span[data-id="${updated.id}"]`);
    if (span) span.textContent = updated.text;

    // Falls ein Marker vorhanden ist, entfernen und neu setzen
    if (activityMarkers.has(updated.id)) {
      activityMarkers.get(updated.id).remove();
      activityMarkers.delete(updated.id);
    }
    addMarkerIfLocationExists(updated);
  });

  // Aktivität wurde gelöscht
  eventSource.addEventListener("activity-delete", (event) => {
    const id = parseInt(event.data);
    console.log("SSE Delete-Event empfangen:", event.data);
    // 1) Das <li> aus der Feed-Liste entfernen
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) li.remove();

    // 2) Marker entfernen
    if (activityMarkers.has(id)) {
        const marker = activityMarkers.get(id);

        try {
            marker.remove();
        } catch (err) {
            console.warn("⚠️ marker.remove() fehlgeschlagen:", err);
        }

        // Optional: Popup „entkoppeln“
        marker.setPopup(null);

        // 3) Map-Eintrag entfernen
        activityMarkers.delete(id);

        // Eventuelles DOM-Element vom Marker-Icon nochmal entfernen
        const el = marker.getElement();
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
});

eventSource.addEventListener("friend-request", (event) => {
  const targetUsername = event.data;

  if (targetUsername === username) {
    const notice = document.createElement("div");
    notice.textContent = "🔔 Neue Freundschaftsanfrage erhalten!";
    notice.style.background = "#0077cc";
    notice.style.color = "white";
    notice.style.padding = "1rem";
    notice.style.textAlign = "center";
    notice.style.fontWeight = "bold";
    notice.style.marginBottom = "1rem";

    document.body.prepend(notice);

    setTimeout(() => notice.remove(), 10000);
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

 // 🔍 Nutzer-Suche
 const searchForm = document.getElementById("user-search-form");
 const searchResults = document.getElementById("search-results");

 if (searchForm && searchResults) {
   searchForm.addEventListener("submit", async (e) => {
     e.preventDefault();
     const query = document.getElementById("search-query").value.trim();
     if (!query) return;

     try {
       const res = await fetch("http://localhost:8080/users/search?query=" + encodeURIComponent(query), {
         headers: { Authorization: "Bearer " + token }
       });

       if (!res.ok) throw new Error();

       const users = await res.json();
       searchResults.innerHTML = "";
       if (users.length === 0) {
         searchResults.innerHTML = "<li>Kein Benutzer gefunden.</li>";
       } else {
         users.forEach(user => {
           const li = document.createElement("li");
           li.innerHTML = `<a href="profile.html?user=${user.username}">${user.username}</a>`;
           searchResults.appendChild(li);
         });
       }
     } catch {
       searchResults.innerHTML = "<li>Fehler bei der Suche.</li>";
     }
   });
 }

 window.toggleBox = function(button) {
  const content = button.nextElementSibling;
  const isOpen = content.style.display === "block";
  content.style.display = isOpen ? "none" : "block";

  if (isOpen) {
    button.textContent = button.textContent.replace("verbergen", "anzeigen");
  } else {
    button.textContent = button.textContent.replace("anzeigen", "verbergen");
  }

  // Map neu zeichnen, falls betroffen
  if (content.querySelector("#map")) {
    map.resize();
  }
};

})();


