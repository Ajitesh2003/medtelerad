// src/App.js
import React, { useEffect, useState } from "react";
import { configureCornerstoneWADOImageLoader } from "./dicomImageLoaderConfig";
import DicomViewer from "./components/DicomViewer";

configureCornerstoneWADOImageLoader();

function App() {
  const [seriesList, setSeriesList] = useState([]);

  useEffect(() => {
    const fetchLocalMetadata = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/metadata"); // load from api
        const data = await res.json();

        setSeriesList(data || []);
      } catch (err) {
        console.error("Failed to load local metadata.json", err);
      }
    };

    fetchLocalMetadata();
  }, []);

  return (
    <div style={{ display: "flex", padding: 20 }}>
      {seriesList.length ? (
        <DicomViewer seriesList={seriesList} />
      ) : (
        <p>Loading series...</p>
      )}
    </div>
  );
}

export default App;
