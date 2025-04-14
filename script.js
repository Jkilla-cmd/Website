
document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authButton = document.getElementById('auth-button');
  const toggleLink = document.getElementById('toggle-link');
  const authContainer = document.getElementById('auth-container');
  const dashboard = document.getElementById('dashboard');
  const userEmailSpan = document.getElementById('user-email');
  const clockButton = document.getElementById('clock-button');
  const entriesList = document.getElementById('entries');
  const logoutButton = document.getElementById('logout');

  let isLogin = true;

  function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
  }

  function saveUser(email, password) {
    const users = getUsers();
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
  }

  function getEntries(email) {
    return JSON.parse(localStorage.getItem(email + '_entries') || '[]');
  }

  function saveEntry(email, entry) {
    const entries = getEntries(email);
    entries.unshift(entry);
    localStorage.setItem(email + '_entries', JSON.stringify(entries));
  }

  function showEntries(email) {
    const entries = getEntries(email);
    entriesList.innerHTML = '';
    entries.forEach(e => {
      const li = document.createElement('li');
      li.textContent = `${e.type} at ${e.time}`;
      entriesList.appendChild(li);
    });
  }

  function toggleAuthMode() {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    authButton.textContent = isLogin ? 'Login' : 'Sign Up';
    toggleLink.textContent = isLogin ? 'Sign Up' : 'Login';
  }

  function login(email, password) {
    const users = getUsers();
    return users[email] === password;
  }

  function initDashboard(email) {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userEmailSpan.textContent = email;
    showEntries(email);

    clockButton.onclick = () => {
      const time = new Date().toLocaleString();
      const lastEntry = getEntries(email)[0];
      const type = lastEntry && lastEntry.type === 'Clock In' ? 'Clock Out' : 'Clock In';
      saveEntry(email, { type, time });
      showEntries(email);
    };

    logoutButton.onclick = () => {
      location.reload();
    };
  }

  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
  });

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isLogin) {
      if (login(email, password)) {
        initDashboard(email);
      } else {
        alert('Invalid email or password');
      }
    } else {
      saveUser(email, password);
      alert('Account created. Please login.');
      toggleAuthMode();
    }
  });
});
