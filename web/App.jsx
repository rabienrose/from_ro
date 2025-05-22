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
  const [mapName, setMapName] = useState("");
  useEffect(() => {
    if (!MapEditor.b_init) {
      MapEditor.init();
      setMapName("izlu2dun.rsw");
      MapEditor.loadMap("izlu2dun.rsw");
    }
    console.log("MapEditor.b_init", MapEditor.b_init);
  }, []);
  return (
    <div id="app-container">
      <div className="control-panel">
        <button className="normal-item" onClick={() => {
          MapEditor.moveCameraToSelected();
        }}>移动到选中</button>
        <input className="normal-item map-name-input" type="text" placeholder="地图名字" value={mapName} onChange={(e) => {
          setMapName(e.target.value);
        }}/>
        <button className="normal-item" onClick={() => {
          MapEditor.loadMap(mapName);
        }}>加载地图</button>
        <button className="normal-item" onClick={() => {
          MapEditor.showModels();
        }}>显示物件</button>
        <button className="normal-item" onClick={() => {
          MapEditor.showBoxes();
        }}>显示包围盒</button>
      </div>
    </div> 
  );
};

export default App;