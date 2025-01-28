const { app, BrowserWindow, ipcMain } = require("electron");
const net = require("net");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    title: "Snake Synth",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "..", "build", "index.html"));
  win.maximize();

  win.webContents.openDevTools();

  let socket;

  socket = new net.Socket();
  socket.connect(1337, "127.0.0.1", () => {
    console.log("Connected to server!");
  });

  socket.on("data", (data) => {
    const message = JSON.parse(data);

    if (win) {
      win.webContents.send("sinewave-data", message);
    }
  });

  ipcMain.handle("send-to-server", async (event, message) => {
    socket.write(message);
    return "Message sent";
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
