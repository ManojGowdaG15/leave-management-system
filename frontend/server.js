const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Frontend server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle React routing - return index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // IMPORTANT: Bind to all network interfaces

app.listen(port, host, () => {
  console.log(`🚀 Frontend server running on http://${host}:${port}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'build')}`);
});