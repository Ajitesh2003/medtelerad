// src/components/DicomViewer.js
import React, { useEffect, useRef, useState } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";

const tools = [
  { name: "Wwwc", mode: "active" },
  { name: "Zoom", mode: "active" },
  { name: "Pan", mode: "active" },
  { name: "Length", mode: "active" },
  { name: "Angle", mode: "active" },
  { name: "StackScrollMouseWheel", mode: "active" },
];

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.dicomParser = dicomParser;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();

const DicomViewer = ({ seriesList }) => {
  const elementRef = useRef(null);
  const [selectedSeries, setSelectedSeries] = useState(seriesList[0]);
  const [stack, setStack] = useState({ imageIds: [], currentImageIdIndex: 0 });
  const [activeTool, setActiveTool] = useState("Wwwc");

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !selectedSeries) return;

    cornerstone.enable(element);

    const imageIds = selectedSeries.imageIds;
    const stackData = {
      currentImageIdIndex: 0,
      imageIds: imageIds,
    };

    cornerstone.loadAndCacheImage(imageIds[0]).then((image) => {
      cornerstone.displayImage(element, image);
      cornerstoneTools.addStackStateManager(element, ["stack"]);
      cornerstoneTools.addToolState(element, "stack", stackData);

      tools.forEach((tool) => {
        const ToolClass = cornerstoneTools[`${tool.name}Tool`];
        if (!cornerstoneTools.getToolForElement(element, tool.name)) {
          cornerstoneTools.addTool(ToolClass);
        }
      });

      cornerstoneTools.setToolActive(activeTool, { mouseButtonMask: 1 });
      setStack(stackData);
    });

    return () => {
      cornerstone.disable(element);
    };
  }, [selectedSeries]);

  const handleSeriesChange = (e) => {
    const newSeries = seriesList.find(
      (s) => s.SeriesInstanceUID === e.target.value
    );
    setSelectedSeries(newSeries);
  };

  const jumpToImage = (index) => {
    const element = elementRef.current;
    if (!element || !stack.imageIds[index]) return;

    cornerstone.loadAndCacheImage(stack.imageIds[index]).then((image) => {
      cornerstone.displayImage(element, image);
      stack.currentImageIdIndex = index;
    });
  };

  const handleToolChange = (tool) => {
    const element = elementRef.current;
    if (!element) return;

    cornerstoneTools.setToolActive(tool, { mouseButtonMask: 1 });
    setActiveTool(tool);
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {/* Sidebar */}
      <div style={{ width: "20%", height: "100vh", overflowY: "auto" }}>
        <h3>Series</h3>
        <select
          onChange={handleSeriesChange}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          {seriesList.map((s, i) => (
            <option key={i} value={s.SeriesInstanceUID}>
              {s.SeriesDescription || `Series ${i + 1}`}
            </option>
          ))}
        </select>

        <h4>Thumbnails</h4>
        {selectedSeries?.imageIds.map((imgId, idx) => (
          <div
            key={idx}
            onClick={() => jumpToImage(idx)}
            style={{
              marginBottom: "5px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            <img
              src={imgId}
              alt={`Slice ${idx + 1}`}
              style={{ width: "100%" }}
              onError={(e) => (e.target.style.display = "none")}
            />
            <p style={{ fontSize: 12, textAlign: "center" }}>
              Slice {idx + 1}
            </p>
          </div>
        ))}
      </div>

      {/* Viewer and Tool UI */}
      <div style={{ flex: 1 }}>
  {/* Tool Buttons */}
  <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
    {tools.map((tool, i) => (
      <button
        key={i}
        onClick={() => handleToolChange(tool.name)}
        style={{
          padding: "6px 12px",
          background: activeTool === tool.name ? "#007bff" : "lightgray",
          color: activeTool === tool.name ? "white" : "black",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {tool.name}
      </button>
    ))}
  </div>

  {/* DICOM Viewer */}
  <div
    style={{
      height: "80vh",
      backgroundColor: "black",
      border: "1px solid gray",
    }}
    ref={elementRef}
  />
</div>

    </div>
  );
};

export default DicomViewer;
