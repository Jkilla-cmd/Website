
function toggleAuth() {
  document.getElementById("auth-container").classList.toggle("hidden");
  document.getElementById("signup-container").classList.toggle("hidden");
}

function signup() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  if (email && password) {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[email]) {
      alert("User already exists!");
    } else {
      users[email] = { password, logs: [] };
      localStorage.setItem("users", JSON.stringify(users));
      alert("Signup successful! Please log in.");
      toggleAuth();
    }
  }
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[email] && users[email].password === password) {
    localStorage.setItem("loggedInUser", email);
    showDashboard(email);
  } else {
    alert("Invalid login credentials.");
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("auth-container").classList.remove("hidden");
}

function showDashboard(email) {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("signup-container").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("user-email").textContent = email;
  renderLogs();
}

function clockIn() {
  const email = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  users[email].logs.push({ type: "Clock In", time: new Date().toLocaleString() });
  localStorage.setItem("users", JSON.stringify(users));
  renderLogs();
}

function clockOut() {
  const email = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  users[email].logs.push({ type: "Clock Out", time: new Date().toLocaleString() });
  localStorage.setItem("users", JSON.stringify(users));
  renderLogs();
}

function renderLogs() {
  const email = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  const logs = users[email].logs || [];
  const logList = document.getElementById("log-list");
  logList.innerHTML = "";
  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.type} - ${log.time}`;
    logList.appendChild(li);
  });
}

window.onload = () => {
  const email = localStorage.getItem("loggedInUser");
  if (email) {
    showDashboard(email);
  }
};
