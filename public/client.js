// client.js
// Frontend code that connects xterm.js to the backend WebSocket.

const termContainer = document.getElementById('terminal');
const hostEl = document.getElementById('host');
const portEl = document.getElementById('port');
const usernameEl = document.getElementById('username');
const authEl = document.getElementById('auth');
const passwordEl = document.getElementById('password');
const credsLabel = document.getElementById('credsLabel');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusEl = document.getElementById('status');

let term = null;
let socket = null;

function setStatus(s) {
  statusEl.textContent = s;
}

authEl.addEventListener('change', () => {
  if (authEl.value === 'password') {
    credsLabel.innerHTML = 'Password: <input id="password" type="password">';
  } else {
    credsLabel.innerHTML = 'Private Key (PEM): <input id="password" type="text" placeholder="-----BEGIN...">';
  }
});

function createTerminal() {
  if (term) {
    term.dispose();
  }
  term = new window.Terminal({
    cols: 80,
    rows: 24,
    cursorBlink: true,
    fontFamily: 'monospace',
    theme: {
      background: '#0b1220',
      foreground: '#e6eef6'
    }
  });
  term.open(termContainer);
  // fit addon is not used here to avoid additional dependency, we handle resize simply
  window.addEventListener('resize', () => {
    if (!term) return;
    resizeTerminal();
  });
}

function resizeTerminal() {
  if (!term || !socket || socket.readyState !== WebSocket.OPEN) return;
  const cols = term.cols, rows = term.rows;
  socket.send(JSON.stringify({ type: 'resize', cols, rows }));
}

function wireTerminalToSocket() {
  if (!term || !socket) return;

  term.onData(data => {
    socket.send(JSON.stringify({ type: 'input', data }));
  });

  socket.addEventListener('message', (ev) => {
    let msg = JSON.parse(ev.data);
    if (msg.type === 'data') {
      term.write(msg.data);
    } else if (msg.type === 'connected') {
      setStatus('connected');
      disconnectBtn.disabled = false;
      connectBtn.disabled = true;
    } else if (msg.type === 'error') {
      term.writeln('\r\n*** ERROR: ' + msg.message + '\r\n');
      setStatus('error');
    } else if (msg.type === 'exit') {
      term.writeln('\r\n*** ' + (msg.message || 'Connection closed') + '\r\n');
      setStatus('disconnected');
      disconnectBtn.disabled = true;
      connectBtn.disabled = false;
    }
  });

  socket.addEventListener('close', () => {
    setStatus('socket closed');
    disconnectBtn.disabled = true;
    connectBtn.disabled = false;
  });

  socket.addEventListener('error', (e) => {
    console.error('Socket error', e);
    setStatus('socket error');
  });

  // inform backend of terminal dimensions
  setTimeout(resizeTerminal, 200);
}

connectBtn.addEventListener('click', () => {
  const host = hostEl.value.trim();
  const port = portEl.value.trim() || '22';
  const username = usernameEl.value.trim();
  const auth = authEl.value;
  const password = document.getElementById('password').value;

  if (!host || !username) {
    alert('Enter host and username');
    return;
  }

  // open websocket
  const protocol = (location.protocol === 'https:') ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${location.host}`;
  socket = new WebSocket(wsUrl);

  socket.addEventListener('open', () => {
    createTerminal();
    wireTerminalToSocket();
    // request SSH connect
    socket.send(JSON.stringify({
      type: 'connect',
      host,
      port,
      username,
      password: auth === 'password' ? password : undefined,
      privateKeyPem: auth === 'key' ? password : undefined,
      cols: term.cols,
      rows: term.rows
    }));
    setStatus('connecting...');
  });
});

disconnectBtn.addEventListener('click', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'disconnect' }));
    socket.close();
  }
  setStatus('disconnected');
  disconnectBtn.disabled = true;
  connectBtn.disabled = false;
});

// initialize terminal so user sees something before connecting
createTerminal();
setStatus('idle');
