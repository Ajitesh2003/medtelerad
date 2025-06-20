const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve local DICOM files
app.use("/dicoms", express.static(path.join(__dirname, "public" , "dicoms")));

// Serve metadata
app.get("/api/metadata", (req, res) => {
  const metadataPath = path.join(__dirname, "public", "metadata.json");

  if (fs.existsSync(metadataPath)) {
    const json = fs.readFileSync(metadataPath);
    res.json(JSON.parse(json));
  } else {
    res.status(404).json({ message: "Metadata not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
