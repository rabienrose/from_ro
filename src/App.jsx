import React, { useState, useEffect } from "react";
import print_d from './utils/Debug.js';
import FileManager from './network/FileManager.js';
import Renderer from './render/Renderer.js';
import LoginPage from "./components/LoginPage.jsx";
import CharPage from "./components/CharPage.jsx";
import Session from './utils/SessionStorage.js';
import MapPage from "./components/MapPage.jsx";
import Char from './network/Char.js';
import BGM from './audio/BGM.js';
import AutoNewUser from "./network/AutoNewUser.js";
import MapRenderer from "./render/MapRenderer.js";
import Camera from "./render/Camera.js";
import './App.css';
import test_renderer from "./render/Renderer_test.js";
import Ground from "./render/map/Ground.js";  
FileManager.remoteClient = 'http://localhost:8001';

const App = () => {
  const [showLogin,setShowLogin] = useState(false);
  const [showCharacter,setShowCharacter] = useState(false);
  const [showMap,setShowMap] = useState(false);
  useEffect(() => {
    if (Renderer.gl==null){
      console.log("Renderer.init");
      Renderer.init();
      Renderer.show();
      Camera.setTarget({position:[0,0,0]});
      Camera.init();
      if (AutoNewUser.connected==false){
        AutoNewUser.onEnterMap=()=>{
          setShowMap(true);
        }
        AutoNewUser.start();
      }else{
        setShowMap(true);
      }
    }
    BGM.initHTML5();
  }, []);

  const handleLogin = () => {
    Char.b_inited=false;
    setShowCharacter(true);
    setShowLogin(false);
    BGM.play('01.mp3');
  }
  const handleCharacter = () => {
  }
  return (
    <div id="app-container">
      {showLogin && <LoginPage onLogin={handleLogin} />}
      {showCharacter && <CharPage onCharacter={handleCharacter} />}
      {showMap && <MapPage/>}
    </div> 
  );
};

export default App;