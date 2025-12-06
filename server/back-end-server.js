// back-end-server.js
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

app.post('/saveUnembeddableSongs', (req, res) => {
  fs.writeFile('./UnembeddableSongs.json', JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send('Error saving file');
    res.send('File saved');
  });
});

app.listen(4000, () => console.log('Server running on port 4000'));