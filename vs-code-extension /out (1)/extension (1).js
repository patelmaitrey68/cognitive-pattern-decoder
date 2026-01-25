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
let currentProjectId = null;
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
let pauseTimes = [];
/* =====================
   ACTIVATE
===================== */
function activate(context) {
    // 🔄 Restore token if already logged in
    authToken = context.globalState.get("authToken") || null;
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
        if (pause > 0.5)
            pauseTimes.push(pause);
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
       END SESSION
    ===================== */
    const endSessionCommand = vscode.commands.registerCommand("cognitiveDecoder.endSession", async () => {
        if (!authToken || !currentProjectId) {
            vscode.window.showErrorMessage("Please login and select a project first");
            return;
        }
        const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        const avgPause = pauseTimes.length === 0
            ? 0
            : pauseTimes.reduce((a, b) => a + b, 0) / pauseTimes.length;
        const typingSpeed = sessionTime > 0 ? typedChars / sessionTime : 0;
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
            avgPauseTime: Number(avgPause.toFixed(2)),
            sessionTime
        };
        try {
            await fetch(BASE_URL + "/api/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify(sessionData)
            });
            vscode.window.showInformationMessage("Session saved securely");
        }
        catch (error) {
            vscode.window.showErrorMessage("Failed to save session");
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
        pauseTimes = [];
        currentProjectId = null;
    });
    context.subscriptions.push(endSessionCommand);
}
/* =====================
   DEACTIVATE
===================== */
function deactivate() { }
//# sourceMappingURL=extension.js.map