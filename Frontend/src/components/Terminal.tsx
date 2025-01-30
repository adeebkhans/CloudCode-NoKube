import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const fitAddon = new FitAddon();

function ab2str(buf: ArrayBuffer): string {
  // Converts ArrayBuffer to a string
  return String.fromCharCode(...new Uint8Array(buf));
}

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  theme: {
    background: "black",
  },
};

interface TerminalComponentProps {
  socket: Socket; // Defines the type of the socket prop
}

export const TerminalComponent = ({ socket }: TerminalComponentProps) => {
  const terminalRef = useRef<HTMLDivElement | null>(null); // Add explicit type for ref

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new Terminal(OPTIONS_TERM); // Initialize the terminal
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Request terminal data from the backend
    socket.emit("requestTerminal");

    const terminalHandler = ({ data }: { data: ArrayBuffer }) => {
      if (data instanceof ArrayBuffer) {
        console.error(data); // Log the raw data for debugging
        const strData = ab2str(data); // Convert ArrayBuffer to string
        term.write(strData); // Write the string to the terminal
      }
    };

    // Listen for terminal data from the backend
    socket.on("terminal", terminalHandler);

    // Emit terminal input back to the server
    term.onData((data) => {
      socket.emit("terminalData", { data });
    });

    // Send an initial newline to the backend
    socket.emit("terminalData", { data: "\n" });

    return () => {
      socket.off("terminal", terminalHandler); // Cleanup socket listener
    };
  }, [socket]);

  return (
    <div
      style={{
        width: "40vw",
        height: "400px",
        textAlign: "left",
      }}
      ref={terminalRef}
    />
  );
};
