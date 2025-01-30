import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Editor } from "./Editor";
import { File, RemoteFile, Type } from "./external/editor/utils/file-manager";
import { useSearchParams } from "react-router-dom";
import { Output } from "./Output";
import { TerminalComponent as Terminal } from "./Terminal";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ReactDOMServer from "react-dom/server";

// Custom hook to manage socket connection
function useSocket(replId: string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { username } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!replId || !username) return;

    // Establish WebSocket connection
    const newSocket = io("ws://localhost:3000", {
      query: { replId, username },
      transports: ["websocket"],
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket Connection Error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId, username]);

  return socket;
}

export const CodingPage = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";

  if (!replId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Invalid Repl ID
      </div>
    );
  }

  return <CodingPagePostPodCreation />;
};

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(replId);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true); // state for showing/hiding terminal

  useEffect(() => {
    if (socket) {
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setLoaded(true);
        setFileStructure(rootContent);
      });

      return () => {
        socket.off("loaded");
      };
    }
  }, [socket]);

  const onSelect = (file: File) => {
    if (file.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f.path === file.path)
          );
        });
      });
    } else {
      socket?.emit("fetchContent", { path: file.path }, (data: string) => {
        file.content = data;
        setSelectedFile(file);
      });
    }
  };

  const openOutputInNewTab = () => {
    // Render the Output component to a string
    const outputHtml = ReactDOMServer.renderToString(<Output />);

    // Open a new window and write the output content
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write("<html><head><title>Output</title></head><body>");
      newWindow.document.write(outputHtml); // Insert Output component HTML
      newWindow.document.write("</body></html>");
      newWindow.document.close();
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900 text-gray-100">
      {/* Navbar */}
      <div className="flex justify-between items-center bg-gray-800 p-4 text-white text-lg font-semibold z-10">
        <div>My Coding App</div>

        <div className="flex items-center">
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 mr-2"
          >
            {showOutput ? "Hide Output" : "See Output"}
          </button>
          
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 mr-2"
          >
            {showTerminal ? "Hide Terminal" : "Show Terminal"}
          </button>
          
          <button
            onClick={openOutputInNewTab}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded hover:bg-purple-700"
          >
            Open Output in New Tab
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left Panel (File Sidebar) */}
        <div className="w-3/5 h-full p-1 bg-gray-900 overflow-y-auto">
          {socket && (
            <Editor
              socket={socket}
              selectedFile={selectedFile}
              onSelect={onSelect}
              files={fileStructure}
            />
          )}
        </div>

        {/* Right Panel */}
        <div className="w-2/5 h-full p-4 bg-gray-800 flex flex-col overflow-hidden">
          {showOutput && (
            <div className={`flex-grow overflow-auto ${showTerminal ? 'h-1/2' : 'h-full'}`}>
              <Output />
            </div>
          )}
          {showTerminal && (
            <div className="flex-grow overflow-auto mt-4">
              {socket && <Terminal socket={socket} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
