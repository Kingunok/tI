const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3000;

// Terabox API endpoint
const TERABOX_API_BASE_URL = 'https://api.terabox.com';

// Example Terabox account credentials
const TERABOX_USERNAME = 'your-username';
const TERABOX_PASSWORD = 'your-password';

// Function to authenticate with Terabox API and get access token
async function authenticate() {
  try {
    const response = await axios.post(`${TERABOX_API_BASE_URL}/auth/login`, {
      username: TERABOX_USERNAME,
      password: TERABOX_PASSWORD
    });
    return response.data.token;
  } catch (error) {
    console.error('Failed to authenticate with Terabox:', error.message);
    throw new Error('Failed to authenticate with Terabox API.');
  }
}

// Function to fetch file list from Terabox API
async function getFileList(token) {
  try {
    const response = await axios.get(`${TERABOX_API_BASE_URL}/files`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch file list from Terabox:', error.message);
    throw new Error('Failed to fetch file list from Terabox API.');
  }
}

// Serve static files (HTML, CSS, etc.)
app.use(express.static('public'));

// Endpoint to fetch file list
app.get('/files', async (req, res) => {
  try {
    // Authenticate with Terabox API
    const token = await authenticate();
    
    // Fetch file list from Terabox API
    const fileList = await getFileList(token);
    
    // Send file list as JSON response
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to download a file from Terabox
app.get('/download/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Authenticate with Terabox API
    const token = await authenticate();

    // Fetch file details
    const response = await axios.get(`${TERABOX_API_BASE_URL}/files/${fileId}`, {
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Set response headers for file download
    res.setHeader('Content-disposition', `attachment; filename=${response.data.name}`);
    res.setHeader('Content-type', response.data.contentType);

    // Pipe file stream to response
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
