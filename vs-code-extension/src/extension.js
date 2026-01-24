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
let sessionStartTime = Date.now();
let lastEditTime = Date.now();
// Metrics
let typedChars = 0;
let backspaceCount = 0;
let pasteCount = 0;
let pasteCharacters = 0;
let saveCount = 0;
let fileSwitchCount = 0;
let cursorMoveCount = 0;
let pauseTimes = [];
function activate(context) {
    // 1️⃣ Typing / Backspace / Paste / Pause
    vscode.workspace.onDidChangeTextDocument(event => {
        const now = Date.now();
        const pause = (now - lastEditTime) / 1000;
        if (pause > 0.5) {
            pauseTimes.push(pause);
        }
        lastEditTime = now;
        for (const change of event.contentChanges) {
            // Backspace / delete
            if (change.text === "") {
                backspaceCount += Math.abs(change.rangeLength);
            }
            // Paste detection
            else if (change.text.length > 50) {
                pasteCount++;
                pasteCharacters += change.text.length;
            }
            // Normal typing
            else {
                typedChars += change.text.length;
            }
        }
    });
    // 2️⃣ Save event
    vscode.workspace.onDidSaveTextDocument(() => {
        saveCount++;
    });
    // 3️⃣ File switching
    vscode.window.onDidChangeActiveTextEditor(() => {
        fileSwitchCount++;
    });
    // 4️⃣ Cursor movement
    vscode.window.onDidChangeTextEditorSelection(() => {
        cursorMoveCount++;
    });
    // 5️⃣ End session command
    const endSession = vscode.commands.registerCommand("cognitiveDecoder.endSession", () => {
        const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        const avgPause = pauseTimes.length === 0
            ? 0
            : pauseTimes.reduce((a, b) => a + b, 0) / pauseTimes.length;
        const typingSpeed = sessionTime > 0 ? typedChars / sessionTime : 0;
        const sessionData = {
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
        console.log("🧠 Cognitive Coding Session Data:", sessionData);
        vscode.window.showInformationMessage("Cognitive coding session recorded successfully.");
    });
    context.subscriptions.push(endSession);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map