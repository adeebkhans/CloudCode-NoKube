# Init Service Documentation

## Overview
The Init Service is responsible for handling user registration, login, and project initialization. It facilitates user authentication and provides functionality for creating project environments based on predefined base code for various programming languages.

### Core Features
1. **User Registration and Login:**
   - Users can register and log in to the system.
   - Upon successful login, users receive a token that is used for accessing other functionalities, such as project creation.

2. **Project Initialization:**
   - Users can initialize a project by specifying a programming language and a unique project identifier (replId).
   - The service copies the base code for the selected language from a folder called `code` and pastes it into a user-specific directory structured as `username/replId/`.

---

## API Endpoints

### 1. **Register**
   - **Endpoint:** `/api/register`
   - **Method:** POST
   - **Description:** Allows users to create a new account.
   - **Request Body:**
     ```json
     {
       "username": "string",
       "password": "string"
     }
     ```
   - **Response:**
     - **201 Created:** User registered successfully.
     - **400 Bad Request:** Missing or invalid data.

### 2. **Login**
   - **Endpoint:** `/api/login`
   - **Method:** POST
   - **Description:** Allows users to log in and receive an authentication token.
   - **Request Body:**
     ```json
     {
       "username": "string",
       "password": "string"
     }
     ```
   - **Response:**
     - **200 OK:**
       ```json
       {
         "token": "string"
       }
       ```
     - **401 Unauthorized:** Invalid credentials.

### 3. **Create Project**
   - **Endpoint:** `/api/project`
   - **Method:** POST
   - **Description:** Initializes a new project for the user.
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <token>"
     }
     ```
   - **Request Body:**
     ```json
     {
       "replId": "string",
       "language": "string"
     }
     ```
   - **Response:**
     - **201 Created:** Project initialized successfully.
     - **400 Bad Request:** Missing required fields or duplicate replId.
     - **500 Internal Server Error:** AWS error or other server issues.

---

## Project Initialization Workflow
1. **Token Authentication:**
   - Users must be logged in to access the `/api/project` endpoint.
   - The token from the login process is validated for every request.

2. **Base Code Handling:**
   - The service uses AWS S3 to manage code templates for different programming languages.
   - Base code is stored in a folder structure like `code/<language>/`.

3. **Folder Copy:**
   - When a project is created, the service copies files from `code/<language>/` to `code/<username>/<replId>/`.
   - This ensures each user has an isolated environment for their project.

4. **Error Handling:**
   - If the AWS S3 operation fails, the service returns a 500 error with detailed information about the failure.
   - Duplicate replIds are not allowed for a user.

---

## Example Scenario
1. A user registers with the system.
2. The user logs in and receives a token.
3. The user sends a request to `/api/project` with their token, specifying:
   - `replId`: A unique identifier for the project.
   - `language`: The programming language for the project.
4. The service copies the base code for the specified language into a new folder structured as `code/<username>/<replId>/`.
5. The user can now access their personalized project environment.

---

## Technologies Used
- **Node.js & Express:** Backend framework for handling API requests.
- **MongoDB:** Database for storing user and project information.
- **AWS S3:** Storage service for managing base code templates and project files.
- **JSON Web Tokens (JWT):** Authentication mechanism for securing endpoints.

---

## Error Codes
| Status Code | Description                          |
|-------------|--------------------------------------|
| 201         | Resource created successfully.      |
| 400         | Bad request (missing or invalid data). |
| 401         | Unauthorized (invalid token).       |
| 404         | Resource not found.                 |
| 500         | Internal server error.              |

---

## Conclusion
The Init Service streamlines the process of user authentication and project initialization by leveraging AWS S3 for file management and JWT for secure access control. This ensures a robust and scalable foundation for creating user-specific project environments.

