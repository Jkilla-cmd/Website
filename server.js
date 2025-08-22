// server.js
// Minimal web-based SSH proxy (proof-of-concept).
// WARNING: For production, add HTTPS, authentication, rate-limiting, and better error handling.

const path = require('path');
const http = require('http');
const express = require('express');
const { Server: WebSocketServer } = require('ws');
const { Client } = require('ssh2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Basic HTTP server
const server = http.createServer(app);

// WebSocket server for terminal data
const wss = new WebSocketServer({ server });

// Each websocket connection gets its own SSH client
wss.on('connection', (ws, req) => {
  console.log('New WS connection');

  let sshClient = null;
  let sshStream = null;

  // helper to send JSON messages to client
  const send = (obj) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  };

  ws.on('message', (msg) => {
    // Expect JSON messages {type: "...", ...}
    let data;
    try { data = JSON.parse(msg.toString()); }
    catch (e) { console.error('Invalid JSON from client', e); return; }

    const type = data.type;

    if (type === 'connect') {
      // open SSH connection
      if (sshClient) {
        send({ type: 'error', message: 'Already connected' });
        return;
      }

      const { host, port = 22, username, password, privateKeyPem, cols = 80, rows = 24 } = data;
      sshClient = new Client();

      sshClient.on('ready', () => {
        console.log('SSH client ready');
        // request an interactive shell with pty
        sshClient.shell({ term: 'xterm-color', cols, rows }, (err, stream) => {
          if (err) {
            send({ type: 'error', message: 'Failed to start shell: ' + err.message });
            sshClient.end();
            return;
          }
          sshStream = stream;

          // forward data from ssh -> ws
          stream.on('data', (chunk) => {
            send({ type: 'data', data: chunk.toString('utf8') });
          });

          stream.on('close', () => {
            send({ type: 'exit', message: 'SSH stream closed' });
            sshClient.end();
          });

          stream.stderr && stream.stderr.on('data', (d) => {
            send({ type: 'data', data: d.toString('utf8') });
          });

          send({ type: 'connected', message: 'SSH connected' });
        });
      });

      sshClient.on('error', (err) => {
        console.error('SSH error', err);
        send({ type: 'error', message: 'SSH error: ' + err.message });
      });

      sshClient.on('end', () => {
        console.log('SSH connection ended');
        send({ type: 'exit', message: 'SSH connection ended' });
      });

      // connect options
      const connectOpts = {
        host,
        port: Number(port || 22),
        username
      };

      if (privateKeyPem) connectOpts.privateKey = privateKeyPem;
      else connectOpts.password = password;

      // Note: we disable agent and lookForKeys for explicitness in POC
      connectOpts.tryKeyboard = true;
      sshClient.connect(connectOpts);

    } else if (type === 'input') {
      // send keystrokes to SSH
      if (sshStream) sshStream.write(data.data);
    } else if (type === 'resize') {
      // terminal resized in browser
      const { cols, rows } = data;
      if (sshStream && typeof sshStream.setWindow === 'function') {
        try { sshStream.setWindow(rows, cols, rows * 8, cols * 8); } catch (e) { /* ignore */ }
      }
    } else if (type === 'disconnect') {
      if (sshClient) {
        sshClient.end();
      }
    } else {
      console.warn('Unknown message type:', type);
    }
  });

  ws.on('close', () => {
    console.log('WS closed, cleaning up SSH');
    try { if (sshClient) sshClient.end(); } catch (e) {}
  });

  ws.on('error', (err) => {
    console.error('WS error', err);
    try { if (sshClient) sshClient.end(); } catch (e) {}
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
