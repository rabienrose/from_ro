import React, { useState, useEffect, useRef } from "react";
import print_d from './utils/Debug.js';
import FileManager from './network/FileManager.js';
import Renderer from './render/Renderer.js';
import LoadingPage from "./components/LoadingPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import './App.css';
FileManager.remoteClient = 'http://localhost:8001';

const App = () => {
  const [progress, setProgress] = useState(0);
  const [loading_enabled, enableLoading] = useState(false);
  const [login_enabled, enableLogin] = useState(true);
  const canvasRef = useRef(null);
  const startLoading = () => {
    if (loading_enabled==false) {
      setProgress(0);
      enableLoading(true);
    } else {
      enableLoading(false);
    }
    const intervalId = window.setInterval(() => {
      if (progress < 100) {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          if (newProgress >= 100) {
            enableLoading(false);
            window.clearInterval(intervalId);
          }
          return Math.min(newProgress, 100);
        });
      }
    }, 100);
  }
  useEffect(() => {
    Renderer.init(canvasRef.current, null);
  }, []);
  return (
    <div id="app-container">
      <canvas ref={canvasRef} className="canvas-style"></canvas>
      <LoadingPage progress={progress} b_visible={loading_enabled} />
      <LoginPage b_visible={login_enabled} />
      {/* <button id="loading-button" onClick={() => startLoading()}>Loading</button> */}
    </div> 
  );
};

export default App;