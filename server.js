const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));















app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});