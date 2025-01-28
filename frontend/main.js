const { app, BrowserWindow, ipcMain } = require('electron');
const net = require("net");
const path = require("path");

function createWindow () {
  const win = new BrowserWindow({
    title: "Snake Synth",
    width: 800,
    height: 600,

  })

  win.loadFile(path.join(__dirname, "build", "index.html"))
}

let socket;

app.whenReady().then(() => {
  createWindow();

  socket = new net.Socket();
  socket.connect(1337, '127.0.0.1', () => {
    console.log('Connected to server!');
  });

  socket.on('data', (data) => {
    console.log('Received:', data.toString());
  });

  ipcMain.handle('send-to-server', async (event, message) => {
    socket.write(message);
    return 'Message sent';
  });
});