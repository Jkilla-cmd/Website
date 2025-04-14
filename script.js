function showSignup() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('signup-container').style.display = 'block';
}

function showLogin() {
  document.getElementById('signup-container').style.display = 'none';
  document.getElementById('login-container').style.display = 'block';
}

function signup() {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  localStorage.setItem(email, password);
  alert('Account created! Please log in.');
  showLogin();
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const storedPassword = localStorage.getItem(email);
  if (storedPassword === password) {
    localStorage.setItem('currentUser', email);
    showDashboard(email);
  } else {
    alert('Invalid credentials.');
  }
}

function showDashboard(email) {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('signup-container').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('user-email').textContent = email;
  loadLogs(email);
}

function clockIn() {
  addLog('Clock In');
}

function clockOut() {
  addLog('Clock Out');
}

function addLog(action) {
  const email = localStorage.getItem('currentUser');
  const logs = JSON.parse(localStorage.getItem(email + '_logs') || '[]');
  logs.push({ action, time: new Date().toLocaleString() });
  localStorage.setItem(email + '_logs', JSON.stringify(logs));
  loadLogs(email);
}

function loadLogs(email) {
  const logs = JSON.parse(localStorage.getItem(email + '_logs') || '[]');
  const list = document.getElementById('log-list');
  list.innerHTML = '';
  logs.forEach(log => {
    const li = document.createElement('li');
    li.textContent = `${log.action} at ${log.time}`;
    list.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem('currentUser');
  document.getElementById('dashboard').style.display = 'none';
  showLogin();
}

function toggleMode() {
  document.body.classList.toggle('light-mode');
}

window.onload = () => {
  const email = localStorage.getItem('currentUser');
  if (email) showDashboard(email);
};
