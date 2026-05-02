"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const socket_io_client_1 = require("socket.io-client");
function getBackendUrl() {
    const config = vscode.workspace.getConfiguration("cognitiveDecoder");
    return config.get("backendUrl", "http://localhost:8080");
}
const BASE_URL = getBackendUrl();
/* =====================
   SESSION & AUTH STATE
===================== */
let sessionStartTime = Date.now();
let lastEditTime = Date.now();
let authToken = null;
let refreshToken = null;
let currentProjectId = null;
let socket = null;
/* =====================
   UTILS
===================== */
function getUserIdFromToken(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
        const payload = JSON.parse(decodedJson);
        return payload.userId || payload.id || payload._id;
    }
    catch (e) {
        return null;
    }
}
function connectSocket(token) {
    if (socket)
        socket.disconnect();
    socket = (0, socket_io_client_1.io)(BASE_URL);
    const userId = getUserIdFromToken(token);
    if (userId) {
        socket.emit("join", userId);
    }
    socket.on("new_notification", (notif) => {
        let icon = "🔔 ";
        if (notif.type === "focus")
            icon = "🎯 ";
        if (notif.type === "distraction")
            icon = "🚨 ";
        if (notif.type === "fatigue")
            icon = "🥱 ";
        vscode.window.showInformationMessage(`Pattern Decoder: ${icon}${notif.message}`);
    });
}
/* =====================
   METRICS
===================== */
let typedChars = 0;
let backspaceCount = 0;
let pasteCount = 0;
let pasteCharacters = 0;
let saveCount = 0;
let fileSwitchCount = 0;
let cursorMoveCount = 0;
let scrollCount = 0;
let debugRunCount = 0;
let terminalOpenCount = 0;
let totalPauseTime = 0;
let pauseCount = 0;
/* =====================
   ACTIVATE
===================== */
function activate(context) {
    // 🔄 Restore tokens if already logged in
    authToken = context.globalState.get("authToken") || null;
    refreshToken = context.globalState.get("refreshToken") || null;
    if (authToken) {
        connectSocket(authToken);
    }
    /* =====================
       LOGIN COMMAND (JWT)
    ===================== */
    const loginCommand = vscode.commands.registerCommand("cognitiveDecoder.login", async () => {
        const email = await vscode.window.showInputBox({
            prompt: "Enter your email"
        });
        const password = await vscode.window.showInputBox({
            prompt: "Enter your password",
            password: true
        });
        if (!email || !password) {
            vscode.window.showErrorMessage("Email and password are required");
            return;
        }
        try {
            const response = await fetch(BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = (await response.json());
            if (!data.token) {
                vscode.window.showErrorMessage("Login failed");
                return;
            }
            authToken = data.token;
            await context.globalState.update("authToken", authToken);
            if (data.refreshToken) {
                refreshToken = data.refreshToken;
                await context.globalState.update("refreshToken", refreshToken);
            }
            connectSocket(authToken);
            vscode.window.showInformationMessage("Login successful");
        }
        catch (error) {
            vscode.window.showErrorMessage("Cannot connect to backend");
        }
    });
    context.subscriptions.push(loginCommand);
    /* =====================
       SELECT PROJECT
    ===================== */
    const selectProjectCommand = vscode.commands.registerCommand("cognitiveDecoder.selectProject", async () => {
        const projectId = await vscode.window.showInputBox({
            prompt: "Enter Project ID"
        });
        if (!projectId) {
            vscode.window.showErrorMessage("Project ID is required");
            return;
        }
        currentProjectId = projectId;
        vscode.window.showInformationMessage(`Project selected: ${projectId}`);
    });
    context.subscriptions.push(selectProjectCommand);
    /* =====================
       TEXT CHANGE EVENTS
    ===================== */
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        const now = Date.now();
        const pause = (now - lastEditTime) / 1000;
        if (pause > 0.5) {
            totalPauseTime += pause;
            pauseCount++;
        }
        lastEditTime = now;
        for (const change of event.contentChanges) {
            if (change.text === "") {
                backspaceCount += Math.abs(change.rangeLength);
            }
            else if (change.text.length > 50) {
                pasteCount++;
                pasteCharacters += change.text.length;
            }
            else {
                typedChars += change.text.length;
            }
        }
    }));
    /* =====================
       SAVE EVENT
    ===================== */
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
        saveCount++;
    }));
    /* =====================
       FILE SWITCH
    ===================== */
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        fileSwitchCount++;
    }));
    /* =====================
       CURSOR MOVE
    ===================== */
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
        cursorMoveCount++;
    }));
    /* =====================
       SCROLL TRACKING
    ===================== */
    context.subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges(() => {
        scrollCount++;
    }));
    /* =====================
       DEBUGGER TRACKING
    ===================== */
    context.subscriptions.push(vscode.debug.onDidStartDebugSession(() => {
        debugRunCount++;
    }));
    /* =====================
       TERMINAL TRACKING
    ===================== */
    context.subscriptions.push(vscode.window.onDidOpenTerminal(() => {
        terminalOpenCount++;
    }));
    /* =====================
       END SESSION
    ===================== */
    const endSessionCommand = vscode.commands.registerCommand("cognitiveDecoder.endSession", async () => {
        if (!authToken || !currentProjectId) {
            vscode.window.showErrorMessage("Please login and select a project first");
            return;
        }
        const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        const avgPause = pauseCount === 0 ? 0 : totalPauseTime / pauseCount;
        const activeTime = Math.max(sessionTime - totalPauseTime, 1); // Avoid div by zero
        const typingSpeed = typedChars / activeTime;
        const sessionData = {
            projectId: currentProjectId,
            typingSpeed: Number(typingSpeed.toFixed(2)),
            typedChars,
            backspaceCount,
            pasteCount,
            pasteCharacters,
            saveCount,
            fileSwitchCount,
            cursorMoveCount,
            scrollCount,
            debugRunCount,
            terminalOpenCount,
            avgPauseTime: Number(avgPause.toFixed(2)),
            sessionTime
        };
        const sendSessionData = async (token) => {
            return await fetch(BASE_URL + "/api/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(sessionData)
            });
        };
        try {
            let response = await sendSessionData(authToken);
            if (response.status === 401) {
                // Attempt refresh
                if (refreshToken) {
                    const refreshRes = await fetch(BASE_URL + "/api/auth/refresh", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: refreshToken })
                    });
                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        authToken = refreshData.token;
                        refreshToken = refreshData.refreshToken;
                        await context.globalState.update("authToken", authToken);
                        await context.globalState.update("refreshToken", refreshToken);
                        // Replay save request
                        response = await sendSessionData(authToken);
                    }
                }
                if (response.status === 401) {
                    vscode.window.showErrorMessage("Session expired! Please run Login again to save.");
                    authToken = null;
                    refreshToken = null;
                    await context.globalState.update("authToken", null);
                    await context.globalState.update("refreshToken", null);
                    return; // Do not clear metrics so user can retry!
                }
            }
            const data = await response.json();
            const sessionId = data.sessionId;
            // CALL ML ANALYSIS
            await fetch(`${BASE_URL}/api/sessions/${sessionId}/end`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            vscode.window.showInformationMessage("Session saved securely");
        }
        catch (error) {
            vscode.window.showErrorMessage("Failed to save session. Check connection.");
            return; // Don't clear metrics if connection failed
        }
        /* =====================
           RESET METRICS
        ===================== */
        sessionStartTime = Date.now();
        lastEditTime = Date.now();
        typedChars = 0;
        backspaceCount = 0;
        pasteCount = 0;
        pasteCharacters = 0;
        saveCount = 0;
        fileSwitchCount = 0;
        cursorMoveCount = 0;
        scrollCount = 0;
        debugRunCount = 0;
        terminalOpenCount = 0;
        totalPauseTime = 0;
        pauseCount = 0;
        currentProjectId = null;
    });
    context.subscriptions.push(endSessionCommand);
}
/* =====================
   DEACTIVATE
===================== */
function deactivate() {
    if (socket) {
        socket.disconnect();
    }
}
//# sourceMappingURL=extension.js.map