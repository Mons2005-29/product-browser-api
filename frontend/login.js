// ===========================
// ADMIN LOGIN
// ===========================
// NOTE: No backend auth endpoint exists in this project, so credentials
// are checked client-side and a session flag gates the Admin Dashboard.
// This is NOT secure authentication - it only prevents casual access.
// If real security is needed later, this must be replaced with a
// server-side login endpoint that issues a session/token.

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Monica@29";

function attemptLogin(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const errorMsg =
        document.getElementById("errorMsg");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {

        sessionStorage.setItem("isAdminLoggedIn", "true");

        window.location.href = "/admin";

    } else {

        errorMsg.textContent = "Invalid username or password.";
        errorMsg.style.display = "block";

    }

}

document.getElementById("loginForm")
    .addEventListener("submit", attemptLogin);

// If already logged in, skip straight to the dashboard
if (sessionStorage.getItem("isAdminLoggedIn") === "true") {

    window.location.href = "/admin";

}