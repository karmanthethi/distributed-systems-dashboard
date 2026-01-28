const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const serviceA = require('./services/service-a');
const serviceB = require('./services/service-b');
const serviceC = require('./services/service-c');
const metricsCollector = require('./observer/metrics-collector');
const metricsAggregator = require('./observer/metrics-aggregator');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('renderer/index.html');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  serviceA.start();
  serviceB.start();
  serviceC.start();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-metrics', async () => {
  return metricsAggregator.getAggregatedMetrics();
});

ipcMain.handle('simulate-traffic', async () => {
  const services = [serviceA, serviceB, serviceC];
  const promises = [];
  
  for (let i = 0; i < 10; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    promises.push(service.simulateRequest());
  }
  
  await Promise.all(promises);
  return { success: true };
});
