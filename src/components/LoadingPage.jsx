import React, { useState, useEffect } from "react";
import FileManager from "../network/FileManager.js";
import "./LoadingPage.css";

const LoadingPage = ({
  progress,
  height = "30px",
  backgroundColor = "#ddd",
  foregroundColor = "#4caf50",
  b_visible = true
}) => {
  const [img_src, setImgSrc] = useState(null);
  useEffect(() => {
    if (b_visible) {
      FileManager.load("/resources/background/background.jpg").then((img) => {
        console.log(img);
        setImgSrc(img);
      });
    }
  }, [b_visible]);
  
  if (!b_visible) {
    return null;
  }else{
    return (
      <div id="root-container">
        <img src={img_src}></img>
        <div
          className="progress-bar-container"
          style={{
          height: height,
          backgroundColor: backgroundColor
        }}
        >
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: foregroundColor
            }}
          ></div>
        </div>
      </div>
    );
  }
};

export default LoadingPage;