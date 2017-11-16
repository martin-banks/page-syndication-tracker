const electron = require('electron')
const { ipcMain } = electron
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs')
// const sizeOf = require('image-size')
const { promisify } = require('util');
const sizeOf = require('image-size')



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 720})
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const filePath = path.join(__dirname, '__data-store/test_session')
const blacklist = [
  '.DS_Store',
]
/* eslint-disable */
function processFiles(files) {
  const makeImages = files
    .filter(f => !blacklist.includes(f.file))
    .map((f, i) => {
      const { width, height } = f
      const ratio = width / height
      return  `<img 
          style="
            position: absolute; 
            top: 0; 
            left: 0;
            width: ${width}px;
            height: ${height * ratio}px
          " 
          src="${filePath}/${f.file}" 
          data-width="${f.width}"
          data-index="${i}"
          data-height="${f.height}"
        />`
      }).join('')
  return `<div style="position: relative">${makeImages}</div>`
}

let temp = []

async function getImageSize(files, i) {
  const count = files.length
  try {
    const dimensions = await sizeOf(`${filePath}/${files[i]}`)
    const { width, height } = dimensions
    temp.push({ file: files[i], width, height })
    console.log(dimensions)
    i++
    if (i < count) await getImageSize(files, i)
  } catch (err) {
    console.error(err);
  }
}

ipcMain.on('getFiles', async (event, args) => {
  await fs.readdir(filePath, async (err, files) => {
    if (err) console.log(err)
    const newFiles = files.filter(file => !blacklist.includes(file))
    await getImageSize(newFiles, 0)
    event.returnValue = processFiles(temp)
  })
})
