

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');  // Import the CORS package

const app = express();

app.use(cors());  // Use CORS middleware

// Serve static files
app.use(express.static('public'));
// Serve static files from the "public" directory
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Serve the HTML file
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');

  // Log the path being accessed
  console.log("Serving file from:", filePath);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`${filePath} does not exist`);
      res.status(404).send('File not found');
    } else {
      console.log(`${filePath} exists`);
      res.sendFile('/usr/src/app/public/index.html');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
