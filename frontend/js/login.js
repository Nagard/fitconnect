document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");
  
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error("Login fehlgeschlagen");
      }
  
      const data = await response.json();
      localStorage.setItem("jwt_token", data.token);
  
      // Weiterleitung zum Feed
      window.location.href = "feed.html";
    } catch (err) {
      errorMsg.textContent = "Login fehlgeschlagen. Bitte überprüfe deine Eingaben.";
    }
  });