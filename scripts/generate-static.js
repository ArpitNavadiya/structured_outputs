const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, '../bypass-static');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create index.html with a message
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Structured Outputs - Temporary Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    .cta {
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #0060df;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Structured Outputs</h1>
    <p>This is a temporary deployment while we resolve Storybook configuration issues.</p>
    <p>The main application is currently being configured to work properly with Vercel deployment.</p>
    <div class="cta">
      <a href="https://github.com/ArpitNavadiya/structured_outputs" class="button">View on GitHub</a>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outputDir, 'index.html'), html);
console.log('Generated static placeholder site');

// Create a .vercelignore file to exclude node_modules
// This will help deployment speed
fs.writeFileSync(path.join(__dirname, '../.vercelignore'), 'node_modules\n.storybook\nsrc\n');
console.log('Created .vercelignore');

console.log('Static site generation complete');