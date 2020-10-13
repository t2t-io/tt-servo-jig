const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  // return `${timestamp} [${label}] ${level}: ${message}`;
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'debug',
  format: combine(
    // label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    // new transports.File({ filename: `log.txt` })
  ]
});


const {ipcMain:ipc} = require('electron');
const serialport = require('serialport');
var mport;
connectuart();
const knownUsbTtlMfrs = [
  'ftdi', 'silicon labs', 'wch.cn'
];
async function connectuart(){
  var ports = await serialport.list();
  logger.debug('ports listed:' + JSON.stringify(ports,null,2))
  ports = ports.filter(   // BEWARE!! this filering has its limit due to host (Windows) uncertain naming converntion, depending on what USB drivers' installed on the host.  Sometimes it'd be assigned with generic name like Microsoft serial device. 
    e => knownUsbTtlMfrs.find( 
      i => i == e.manufacturer.toLowerCase()
    ) != undefined 
  );
  if(ports.length >1 || ports.length ==0){
    logger.error(`Error: ${ports.length} USB TTL device found`);
    logger.error(JSON.stringify(ports));
    // process.exit(1);
    return ports.length;
  }
  logger.info("found USB TTL serial port");
  logger.info(JSON.stringify(ports, null, 2) );

  mport = await new serialport(ports[0].path, {baudRate: 115200});
  logger.info('mport found: '+ mport?true:false);

  mport.on('data', d => {
    logger.debug('serial on data: '+ d);
  });
}

ipc.on('servo', (e,r)=>{
  if(mport){
    mport.write(r);
  }else{
    connectuart();
  }
});
