import React, { useState, useEffect } from "react";
import './App.css';
import MapEditor from "./core/MapEditor.js";

function getCurrentTime() {
  const now = new Date();
  const min = now.getMinutes().toString().padStart(2, '0');
  const sec = now.getSeconds().toString().padStart(2, '0');
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${min}:${sec}.${ms}`;
}

const App = () => {
  const [showLoading,setShowLoading] = useState(false);
  const [progress,setProgress] = useState(0);
  useEffect(() => {
    MapEditor.init();
    MapEditor.showMap("anthell01.rsw");
  }, []);
  return (
    <div id="app-container">
    </div> 
  );
};

export default App;