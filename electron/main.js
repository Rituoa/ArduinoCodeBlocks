// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 1. Setup the Database and Proxy Backend
function startBackend() {
  const server = jsonServer.create();
  
  // Create a safe place to store db.json on the user's hard drive
  const dbPath = path.join(app.getPath('userData'), 'db.json');
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], projects: [] }));
  }
  
  const router = jsonServer.router(dbPath);
  const middlewares = jsonServer.defaults();

  // Re-create the Wokwi Proxy for the production app!
  server.use('/wokwi-api', createProxyMiddleware({
    target: 'https://hexi.wokwi.com',
    changeOrigin: true,
    pathRewrite: { '^/wokwi-api': '' }
  }));

  server.use(middlewares);
  server.use(router);
  server.listen(5000, () => {
    console.log('Internal Backend Running on port 5000');
  });
}

// 2. Setup the Desktop Window
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true, // Hides File/Edit/View menu
    icon: path.join(__dirname, '../public/vite.svg'), // Optional: Add a custom icon later
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // Load the compiled React frontend!
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
