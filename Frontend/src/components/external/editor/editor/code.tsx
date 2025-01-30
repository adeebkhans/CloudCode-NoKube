import Editor from "@monaco-editor/react"; // Monaco editor for code editing
import { File } from "../utils/file-manager"; // File type for selected file
import { Socket } from "socket.io-client"; // Socket type for communication

interface CodeProps {
  selectedFile: File | undefined; // The currently selected file
  socket: Socket; // The socket connection for updates
}

export const Code = ({ selectedFile, socket }: CodeProps) => {
  // If no file is selected, render nothing
  if (!selectedFile) return null;

  // Extract the file's content and determine its language
  const code = selectedFile.content ?? ""; // Ensure code is a string (fallback to an empty string if undefined)
  let language = selectedFile.name.split(".").pop();

  // Map file extensions to Monaco Editor languages
  if (language === "js" || language === "jsx") language = "javascript";
  else if (language === "ts" || language === "tsx") language = "typescript";
  else if (language === "py") language = "python";

  // Debounce function to reduce the frequency of socket updates
  function debounce(func: (value: string) => void, wait: number) {
    let timeout: NodeJS.Timeout; // Use NodeJS.Timeout for type safety
    return (value?: string) => {
      if (value === undefined) return; // Ignore undefined values
      clearTimeout(timeout); // Clear the previous timeout
      timeout = setTimeout(() => {
        func(value); // Execute the debounced function
      }, wait);
    };
  }

  return (
    <Editor
      height="100vh" // Full viewport height for the editor
      language={language} // Language based on file extension
      value={code} // Initial code content
      theme="vs-dark" // Monaco editor theme
      onChange={debounce((value) => {
         //!!!! Should send diffs, for now sending the whole file !!!!!!

        // Emit the updated content to the socket
        socket.emit("updateContent", {
          path: selectedFile.path, // File path for identifying the file
          content: value, // Updated file content
        });
      }, 500)} // 500ms debounce delay
    />
  );
};
