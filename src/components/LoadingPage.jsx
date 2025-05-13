import React, { useState, useEffect } from "react";
import FileManager from "../network/FileManager.js";
import "./LoadingPage.css";

const LoadingPage = ({
  progress
}) => {
  return (
    <div className="loading-container">
      <div className="loading-wrapper">
        <div className="loading-title">加载中...</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;