import React, { useState, useEffect } from "react";
import print_d from './utils/Debug.js';
import './App.css';
import LoadingPage from "./components/LoadingPage.jsx";


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
    console.log(`start at ${getCurrentTime()}`);
    import("./network/AutoNewUser.js").then(module => {
      console.log(`loaded at ${getCurrentTime()}`);
      setProgress(0);
      module.default.setProgress=setProgress;
      module.default.onEnterMap=()=>{
        console.log("onMapChange at", getCurrentTime());
        setShowLoading(false); 
      }
      module.default.start();
    });
    setShowLoading(true);
  }, []);
  return (
    <div id="app-container">
      {showLoading && <LoadingPage progress={progress} />}
    </div> 
  );
};

export default App;