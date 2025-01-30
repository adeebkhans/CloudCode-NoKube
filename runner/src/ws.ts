import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { fetchS3Folder, saveToS3 } from "./aws";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { TerminalManager } from "./pty";

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Restrict this in production
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", async (socket) => {
        const replId = socket.handshake.query.replId as string;
        const username = socket.handshake.query.username as string;

        if (!replId || !username) {
            console.error("Missing replId or username");
            socket.disconnect();
            terminalManager.clear(socket.id);
            return;
        }

        try {
            const localPath = path.join(__dirname, `../tmp/${username}/${replId}`);
            await fetchS3Folder(`code/${username}/${replId}`, localPath);

            socket.emit("loaded", {
                rootContent: await fetchDir(localPath, ""),
            });

            initHandlers(socket, replId, username);
        } catch (error) {
            console.error("Error loading S3 folder:", error);
        }
    });
}

function initHandlers(socket: Socket, replId: string, username: string) {
    socket.on("disconnect", () => {
        console.log("User disconnected");
        terminalManager.clear(socket.id);
    });

    socket.on("fetchDir", async (dir: string, callback) => {
        const dirPath = path.join(__dirname, `../tmp/${username}/${replId}/${dir}`);
        try {
            const contents = await fetchDir(dirPath, dir);
            callback(contents);
        } catch (error) {
            console.error("Error fetching directory:", error);
            callback([]);
        }
    });

    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        const fullPath = path.join(__dirname, `../tmp/${username}/${replId}/${filePath}`);
        try {
            const data = await fetchFileContent(fullPath);
            callback(data);
        } catch (error) {
            console.error("Error fetching content:", error);
            callback(null);
        }
    });

    socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
        const fullPath = path.join(__dirname, `../tmp/${username}/${replId}/${filePath}`);
        try {
            await saveFile(fullPath, content);
            await saveToS3(`code/${username}/${replId}`, filePath, content);
            console.log(`Updated content for ${filePath}`);
        } catch (error) {
            console.error("Error updating content:", error);
        }
    });

    socket.on("requestTerminal", () => {
        terminalManager.createPty(socket.id, replId, (data) => {
            socket.emit("terminal", {
                data: Buffer.from(data, "utf-8"),
            });
        });
    });

    socket.on("terminalData", ({ data }: { data: string }) => {
        terminalManager.write(socket.id, data);
    });
}
