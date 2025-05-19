import React, { useState, useEffect } from "react";
import './App.css';
import FileManager from "../src/network/FileManager.js";

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
    FileManager.load("/maps/prt_fild06.gat")
    .then(data=>{
      console.log(data);
    });
  }, []);
  return (
    <div id="app-container">
      Hello World
    </div> 
  );
};

export default App;