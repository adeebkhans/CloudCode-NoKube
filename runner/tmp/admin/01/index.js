const express = require('express');
const app = express();
const port = 3002;

// Serve static files for the animation
app.use(express.static('public'));

app.get('/', (req, res) => {
  // Send a simple HTML page with an animation
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Animated Sunset</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(45deg, #ff8c00, #ff6347, #ff4500, #dc143c);
            animation: gradient-animation 10s infinite;
            height: 100vh;
            font-family: 'Arial', sans-serif;
          }
          h1 {
            color: white;
            font-size: 5rem;
            text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5);
          }
          @keyframes gradient-animation {
            0% {
              background: linear-gradient(45deg, #ff8c00, #ff6347, #ff4500, #dc143c);
            }
            50% {
              background: linear-gradient(45deg, #f39c12, #e74c3c, #c0392b, #8e44ad);
            }
            100% {
              background: linear-gradient(45deg, #ff8c00, #ff6347, #ff4500, #dc143c);
            }
          }
        </style>
      </head>
      <body>
        <h1>Welcome to the Beautiful Sunset</h1>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
