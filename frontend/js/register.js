document.getElementById("register-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");
  const successMsg = document.getElementById("success-msg");

  try {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Registrierung fehlgeschlagen");
    }

    successMsg.textContent = "Registrierung erfolgreich! Du wirst weitergeleitet...";
    errorMsg.textContent = "";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (err) {
    errorMsg.textContent = "Benutzername evtl. bereits vergeben.";
    successMsg.textContent = "";
  }
});
