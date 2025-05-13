import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = (prop) => {

  return (
    <div className="popup-container">
      <div className="popup-wrapper">
        {prop.title && <div className="popup-title">{prop.title}</div>}
        <div className="popup-content">{prop.content}</div>
        <div className="popup-button" onClick={prop.onClose}>{prop.button}</div>
      </div>
    </div>
  );
};

export default Popup;