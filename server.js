const express = require("express");
const path = require("path");

const app = express();

// Serve static files from current folder
app.use(express.static(path.join(__dirname)));

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

module.exports = app;