const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
	width: 1200,
	height: 800,
	webPreferences: {
	    preload: path.join(__dirname, 'preload.js'),
	    contextIsolation: true,
	    nodeIntegration: false,
	},
    });

    if (process.env.VITE_DEV_SERVER_URL) {
	win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
	win.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    
    const menuTemplate = [
	{
	    label: 'File',
	    submenu: [
		{
		    label: "Open",
		    click: () => {
			const focusedWindow = BrowserWindow.getFocusedWindow();
			if (focusedWindow) {
			    focusedWindow.webContents.send('menu-open');
			}
		    },
		    accelerator: 'CmdOrCtrl+O',
		},
		{
		    label: "Save",
		    click: () => {
			const focusedWindow = BrowserWindow.getFocusedWindow();
			if (focusedWindow) {
			    focusedWindow.webContents.send('menu-save');
			}
		    },
		    accelerator: 'CmdOrCtrl+S',
		},
	    ],
	},
	{
	    label: 'Develop',
	    submenu: [
		{
		    role: "reload", label: "Reload"
		},
		{
		    role: "toggledevtools", label: "Toggle Developer Tools"
		},
	    ],
	},
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}


app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle("save-file", async (event, data) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
	filters: [{ name: "MindMap Files", extensions: ["mbloom"] }],
    });
    if (!canceled && filePath) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
	return true;
    }
    return false;
});

ipcMain.handle("open-file", async () => {
    const { filePaths } = await dialog.showOpenDialog({
	filters: [{ name: "MindMap Files", extensions: ["mbloom"] }],
	properties: ['openFile'],
    });
    if (filePaths && filePaths[0]) {
	const content = fs.readFileSync(filePaths[0], 'utf-8');
	return JSON.parse(content);
    }
    return null;
});

