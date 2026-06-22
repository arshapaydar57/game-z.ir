<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Game-z.ir | Coming Soon</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }

    body {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      color: white;
      text-align: center;
    }

    .container {
      animation: fadeIn 2s ease-in-out;
    }

    h1 {
      font-size: 3rem;
      margin-bottom: 15px;
      letter-spacing: 2px;
    }

    p {
      font-size: 1.2rem;
      opacity: 0.8;
      margin-bottom: 30px;
    }

    .loader {
      width: 60px;
      height: 60px;
      border: 5px solid rgba(255,255,255,0.2);
      border-top: 5px solid #00ffd5;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 1s linear infinite;
    }

    .footer {
      margin-top: 30px;
      font-size: 0.9rem;
      opacity: 0.6;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>🚀 Coming Soon</h1>
    <p>We are building something awesome for Game-z.ir</p>

    <div class="loader"></div>

    <div class="footer">
      © 2026 Game-z.ir - All rights reserved
    </div>
  </div>
</body>
</html>