# Web PuTTY (POC)

A tiny proof-of-concept web-based SSH client using xterm.js (frontend) and ssh2 + ws (backend).

## Run locally

1. Install Node.js (16+ recommended)
2. `npm install`
3. `node server.js`
4. Open `http://localhost:3000` and try connecting to an SSH server.

## Notes & Security

- This is a proof-of-concept only.
- **Do NOT** expose this publically without:
  - HTTPS + secure cookies
  - Authentication (login for users)
  - CSRF protection / rate limiting
  - Avoid accepting raw passwords from untrusted clients — prefer ephemeral tokens or server-side credentials.
- For production consider solutions like SSH bastion, per-session credentials, logging, auditing.

