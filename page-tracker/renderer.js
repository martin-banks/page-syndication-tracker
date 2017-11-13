const { ipcRenderer } = require('electron')

const app = document.querySelector('#app')
const fileList = (ipcRenderer.sendSync('getFiles', ''))

app.innerHTML = `files are: ${fileList}`

