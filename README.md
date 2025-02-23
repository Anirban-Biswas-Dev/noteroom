# NoteRoom

**NoteRoom** is a collaborative note-sharing platform designed to help students share, organize, and access study materials effortlessly.

## Features

- **Note Sharing**: Upload and share notes with classmates.
- **Search & Discover**: Find notes by subjects, tags, or keywords.
- **Collaboration**: Work together on shared notes.
- **User Profiles**: Create personalized profiles showcasing your contributions.
- **Secure & Reliable**: Built with secure authentication and data management.

## Tech Stack

- **Frontend**: HTML, CSS
- **Backend**: Node.js with Express.js
- **Programming Language**: TypeScript (compiled to JavaScript)
- **Database**: MongoDB Atlas
- **Templating Engine**: EJS (being migrated to React)
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Environment Variables**: dotenv
- **Build Tools**: tsc (TypeScript Compiler)

## 🔧 Installation

Follow these steps carefully to set up the project on your local machine:

### 1. Clone the repository
Download the project files to your computer:
```bash
 git clone https://github.com/ju4700/noteroom.git
```

### 2. Navigate into the project directory
Move into the newly created directory:
```bash
 cd noteroom
```

### 3. Install dependencies
Install all required packages listed in `package.json`:
```bash
 npm install
```

This will download and set up all the Node.js packages needed for the project.

### 4. Set up environment variables
Create a `.env` file in the root directory to store sensitive data and configuration options. Add the following content:
```plaintext
 MONGODB_URI=your_mongodb_connection_string
 PORT=3000
```
- **MONGODB_URI**: Your MongoDB Atlas connection string.
- **PORT**: The port number where the app will run (default is 3000).

Make sure you never share this file or commit it to version control.

### 5. Compile TypeScript to JavaScript
Convert the TypeScript code into JavaScript using the TypeScript compiler:
```bash
 npx tsc
```

This will generate a `dist/` folder containing the compiled JavaScript files.

### 6. Run database migrations (if any)
Ensure your MongoDB database is up and running. If there are any migrations or initial seed data, run them accordingly.

### 7. Start the development server
Launch the server in development mode:
```bash
 npm run dev
```
The server will start running, and you'll see the logs in your terminal.

### 8. Access the application
Once the server is running, open your web browser and go to:
```plaintext
 http://localhost:3000
```
You should now see the NoteRoom homepage!

## Usage

- **Sign Up/Login** to start sharing notes.
- **Upload Notes** by navigating to the "Add Note" page.
- **Explore Notes** via the search bar or browse categories.
- **Edit or Delete** your own notes anytime.

## Contributing

Contributions are welcome! To get started:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a Pull Request.

---

⭐ **Star** this repo if you find NoteRoom useful!

