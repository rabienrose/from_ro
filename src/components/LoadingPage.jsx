import React, { useState, useEffect } from "react";
import FileManager from "../network/FileManager.js";
import "./LoadingPage.css";
import Globals from "../utils/Globals.js"
const LoadingPage = ({
  progress
}) => {
  useEffect(() => {
    const container = document.querySelector('.loading-container');
    if (container) {
      container.style.backgroundImage = `url("http://${Globals.root_ip}:8002/images/bg2.jpg")`;
    }
  }, []);
  return (
    <div className="loading-container">
      <div className="loading-wrapper">
        <div className="loading-title">加载中...</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{width: `${progress*100}%`}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;