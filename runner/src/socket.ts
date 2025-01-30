import { Server, Socket } from "socket.io"; // Importing the Server class and Socket type from socket.io
import { Server as HttpserverType } from "http"; // Importing Server type from http module for type checking
import axios from "axios"; // Axios for HTTP requests
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { saveToS3 } from "./ws";
import { TerminalManager } from "./pty";
import isTokenValid from "./auth";

const terminalManager = new TerminalManager(); // Create an instance of TerminalManager

export function initWs(httpServer: HttpserverType) {
    const io = new Server(httpServer, {
        cors: {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"],
        //   credentials: true,
        },
        transports: ["websocket", "polling"], // Add 'polling' as fallback
      });
      

    // Listen for incoming WebSocket connections
    io.on("connection", async (socket: Socket) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
        // Assume token is sent in handshake's auth object

        if (!token) {
            console.log("No token provided, disconnecting socket");
            socket.disconnect();
            return;
        }

        const decoded = await isTokenValid(token);

        if (!decoded) {
            console.log("Invalid token, disconnecting socket");
            socket.disconnect();
            return;
        }


        // console.log("Handshake query:", socket.handshake.query);
        // const replId = socket.handshake.query.replId as string;

        const host = socket.handshake.headers.host;
        console.log(`host is ${host}`);
        // Split the host by '.' and take the first part as replId
        const replId = host?.split('.')[0];

        if (!replId) {
            socket.disconnect();
            terminalManager.clear(socket.id);
            return;
        }

        // Emit an event called "loaded" to the client, passing the root directory content
        socket.emit("loaded", {
            rootContent: await fetchDir("/workspace", ""), // Fetch and return the contents of the "/workspace" directory
        });

        socketHandlers(socket, replId); // Register event handlers
    });
}

// Helper function to stop the pod via HTTP POST
async function stopPod(username: string, replId: string): Promise<void> {
    try {
        const response = await axios.post(`http://localhost:3002/${username}/${replId}/stop`);
        console.log(`Successfully stopped pod for ${username}/${replId}:`, response.data.message);
    } catch (error) {
        if (error)
            console.error(`Failed to stop pod for ${username}/${replId}:`);
    }
}

function socketHandlers(socket: Socket, replId: string) {
    socket.on("disconnect", async () => {
        console.log("User disconnected");

        // Example: Call stopPod when the user disconnects
        const username = socket.handshake.query.username as string;
        if (username && replId) {
            console.log(`Stopping pod for ${username}/${replId}...`);
            await stopPod(username, replId);
        }

        terminalManager.clear(socket.id);
    });

    socket.on("fetchDir", async (dir: string, callback) => {
        const dirPath = `/workspace/${dir}`; // Construct the full directory path
        const contents = await fetchDir(dirPath, dir);
        callback(contents); // Return the directory contents to the client via the callback
    });

    // Handle the "fetchContent" event to fetch and return the content of a specific file
    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        const fullPath = `/workspace/${filePath}`;
        const data = await fetchFileContent(fullPath);
        callback(data);
    });

    // Handle the "updateContent" event to update a file's content
    socket.on("updateContent", async ({ path: filePath, content }: { path: string; content: string }) => {
        const fullPath = `/workspace/${filePath}`;
        await saveFile(fullPath, content); // Save the new content to the file system
        await saveToS3(`code/${replId}`, filePath, content); // Upload the updated content to S3 storage
    });

    // Handle the "requestTerminal" event to create and manage a terminal session
    socket.on("requestTerminal", async () => {
        terminalManager.createPty(socket.id, replId, (data, id) => {
            // Emit terminal output data to the client
            socket.emit("terminal", {
                data: Buffer.from(data, "utf-8"), // Convert the terminal output to a UTF-8 buffer
            });
        });
    });

    // Handle the "terminalData" event to send input data to the terminal session
    socket.on("terminalData", async ({ data }: { data: string; terminalId: number }) => {
        terminalManager.write(socket.id, data); // Send the input data to the terminal session
    });
}
