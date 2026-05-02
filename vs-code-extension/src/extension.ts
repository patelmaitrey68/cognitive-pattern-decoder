import * as vscode from "vscode";
import { io, Socket } from "socket.io-client";

function getBackendUrl(): string {
  const config = vscode.workspace.getConfiguration("cognitiveDecoder");
  return config.get<string>("backendUrl", "https://cognitive-backend-2cs1.onrender.com");
}

const BASE_URL = getBackendUrl();


/* =====================
   TYPES
===================== */
interface LoginResponse {
  token: string;
  refreshToken?: string;
}

/* =====================
   SESSION & AUTH STATE
===================== */
let sessionStartTime = Date.now();
let lastEditTime = Date.now();

let authToken: string | null = null;
let refreshToken: string | null = null;
let currentProjectId: string | null = null;
let socket: Socket | null = null;

/* =====================
   UTILS
===================== */
function getUserIdFromToken(token: string): string | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(decodedJson);
    return payload.userId || payload.id || payload._id;
  } catch (e) {
    return null;
  }
}

function connectSocket(token: string) {
  if (socket) socket.disconnect();
  
  socket = io(BASE_URL);
  const userId = getUserIdFromToken(token);
  
  if (userId) {
    socket.emit("join", userId);
  }

  socket.on("new_notification", (notif: any) => {
    let icon = "🔔 ";
    if (notif.type === "focus") icon = "🎯 ";
    if (notif.type === "distraction") icon = "🚨 ";
    if (notif.type === "fatigue") icon = "🥱 ";
    
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
export function activate(context: vscode.ExtensionContext) {

  // 🔄 Restore tokens if already logged in
  authToken = context.globalState.get<string>("authToken") || null;
  refreshToken = context.globalState.get<string>("refreshToken") || null;

  if (authToken) {
    connectSocket(authToken);
  }

  /* =====================
     LOGIN COMMAND (JWT)
  ===================== */
  const loginCommand = vscode.commands.registerCommand(
    "cognitiveDecoder.login",
    async () => {
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

        const data = (await response.json()) as LoginResponse;

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
      } catch (error) {
        vscode.window.showErrorMessage("Cannot connect to backend");
      }
    }
  );

  context.subscriptions.push(loginCommand);

  /* =====================
     SELECT PROJECT
  ===================== */
  const selectProjectCommand = vscode.commands.registerCommand(
    "cognitiveDecoder.selectProject",
    async () => {
      const projectId = await vscode.window.showInputBox({
        prompt: "Enter Project ID"
      });

      if (!projectId) {
        vscode.window.showErrorMessage("Project ID is required");
        return;
      }

      currentProjectId = projectId;
      vscode.window.showInformationMessage(`Project selected: ${projectId}`);
    }
  );

  context.subscriptions.push(selectProjectCommand);

  /* =====================
     TEXT CHANGE EVENTS
  ===================== */
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event:vscode.TextDocumentChangeEvent) => {
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
        } else if (change.text.length > 50) {
          pasteCount++;
          pasteCharacters += change.text.length;
        } else {
          typedChars += change.text.length;
        }
      }
    })
  );

  /* =====================
     SAVE EVENT
  ===================== */
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      saveCount++;
    })
  );

  /* =====================
     FILE SWITCH
  ===================== */
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      fileSwitchCount++;
    })
  );

  /* =====================
     CURSOR MOVE
  ===================== */
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      cursorMoveCount++;
    })
  );

  /* =====================
     SCROLL TRACKING
  ===================== */
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorVisibleRanges(() => {
      scrollCount++;
    })
  );

  /* =====================
     DEBUGGER TRACKING
  ===================== */
  context.subscriptions.push(
    vscode.debug.onDidStartDebugSession(() => {
      debugRunCount++;
    })
  );

  /* =====================
     TERMINAL TRACKING
  ===================== */
  context.subscriptions.push(
    vscode.window.onDidOpenTerminal(() => {
      terminalOpenCount++;
    })
  );

  /* =====================
     END SESSION
  ===================== */
  const endSessionCommand = vscode.commands.registerCommand(
    "cognitiveDecoder.endSession",
    async () => {
      if (!authToken || !currentProjectId) {
        vscode.window.showErrorMessage(
          "Please login and select a project first"
        );
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

      const sendSessionData = async (token: string) => {
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
              const refreshData = await refreshRes.json() as { token: string; refreshToken: string };
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

        const data: any = await response.json();
        const sessionId = data.sessionId;

        // CALL ML ANALYSIS
        await fetch(`${BASE_URL}/api/sessions/${sessionId}/end`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });

        vscode.window.showInformationMessage("Session saved securely");
      } catch (error) {
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
    }
  );

  context.subscriptions.push(endSessionCommand);
}

/* =====================
   DEACTIVATE
===================== */
export function deactivate() {
  if (socket) {
    socket.disconnect();
  }
}
