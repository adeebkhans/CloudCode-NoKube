import { spawn, IPty } from 'node-pty';
import path from 'path';
import fs from 'fs';

const isWindows = process.platform === 'win32';

export class TerminalManager {
    private sessions: { [id: string]: { terminal: IPty; replId: string } } = {};

    constructor() {
        this.sessions = {};
    }

    createPty(id: string, replId: string, onData: (data: string) => void): void {
        try {
            const baseDir = path.join(process.cwd(), 'tmp', 'admin', replId);
            const normalizedPath = path.normalize(baseDir);

            // Ensure directory exists
            if (!fs.existsSync(normalizedPath)) {
                fs.mkdirSync(normalizedPath, { recursive: true });
            }

            let shell: string;
            let shellArgs: string[];

            if (isWindows) {
                shell = 'cmd.exe';
                shellArgs = ['/c', 'cmd.exe'];
            } else {
                shell = 'bash';
                shellArgs = [];
            }

            const term = spawn(shell, shellArgs, {
                name: 'xterm-256color',
                cols: 80,
                rows: 24,
                cwd: normalizedPath,
                env: {
                    ...process.env,
                    TERM: 'xterm-256color',
                    ...(isWindows && {
                        SYSTEMROOT: process.env.SYSTEMROOT,
                        windir: process.env.windir,
                        USERPROFILE: process.env.USERPROFILE,
                        APPDATA: process.env.APPDATA,
                        HOMEDRIVE: process.env.HOMEDRIVE,
                        HOMEPATH: process.env.HOMEPATH,
                        PATH: process.env.PATH,
                    }),
                },
                useConpty: false // Only supported option for Windows
            });

            term.onData((data: string) => {
                try {
                    onData(data);
                } catch (error) {
                    console.error('Error in terminal data handler:', error);
                }
            });

            this.sessions[id] = { terminal: term, replId };

            console.log(`Terminal created for session ${id} in directory ${normalizedPath}`);

        } catch (error) {
            console.error('Error creating terminal:', error);
            throw error;
        }
    }

    write(terminalId: string, data: string): void {
        try {
            const session = this.sessions[terminalId];
            if (session) {
                session.terminal.write(data);
            }
        } catch (error) {
            console.error('Error writing to terminal:', error);
        }
    }

    clear(terminalId: string): void {
        try {
            const session = this.sessions[terminalId];
            if (session) {
                session.terminal.kill();
                delete this.sessions[terminalId];
                console.log(`Terminal ${terminalId} cleared`);
            }
        } catch (error) {
            console.error('Error clearing terminal:', error);
        }
    }
}