# Cloud Code (Testing Version)

## ⚠️ Important Security Notice ⚠️
This version is intended **for development and testing only**. It lacks proper security isolation and scaling mechanisms. For production use, see our [Kubernetes-based solution](https://github.com/adeebkhans/CloudCode).

## Features 🧰
- **Cloud-Based IDE** with syntax highlighting & error detection
- **Real-Time Collaboration** via WebSockets
- **Integrated Terminal** with PTY support
- **File Management** with S3 synchronization
- **Authentication System** (JWT-based)
- **Multi-Language Support** via base templates

## Simplified Architecture 🏠

### Backend Components
1. **Init Service** (Express + MongoDB)
   - Handles user auth (JWT)
   - Manages project templates
   - Local file system operations

2. **Runner service** (Node.js + Socket.IO)
   - File watchers for real-time updates
   - Basic terminal emulation (node-pty)
   - In-memory project storage

### Frontend
- Monaco Editor integration
- Xterm.js terminal
- React-based UI
- Local state management

## Tech Stack 📚
| Component       | Technology                |
|-----------------|---------------------------|
| Editor          | Monaco Editor             |
| Terminal        | Xterm.js + node-pty       |
| Authentication  | JWT + localStorage        |
| Real-Time       | Socket.IO                 |
| Storage         | Local filesystem          |
| Container       | Docker (single container) |

## Getting Started 🚦

### Prerequisites
- Node.js v18+
- Docker Desktop
- MongoDB Community Edition

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/cloud-code-local.git
   cd cloud-code-local
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with local values
   ```

3. **Install Dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

4. **Start Services**
   ```bash
   # Backend
   npm run start:dev

   # Frontend
   cd frontend && npm run dev
   ```

5. **Initialize Docker Container**
   ```bash
   docker build -t cloud-code-local .
   docker run -p 3001:3001 cloud-code-local
   ```

## Development Flow 🔄
1. Users authenticate via JWT
2. Projects created in `./projects/{username}/{replid}` directory
3. Terminal sessions run in host environment
4. File changes trigger Socket.IO updates
5. All data stored on cloud persistence



## Recommended Alternatives ✅
For secure, scalable deployment use our production-ready version:
[Cloud Code (Kubernetes Version)](https://github.com/adeebkhans/CloudCode) featuring:
- Container isolation
- Resource limits
- Secure ingress
- Audit logging
- Auto-scaling

---

**Warning**: Never expose this local version to public networks. Use only behind firewall for development purposes.
