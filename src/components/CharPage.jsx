import React, { useState, useEffect } from "react";
import "./CharPage.css";
import LoadingPage from "./LoadingPage";
import StringParser from "../utils/StringParser";
import Model from "../widget/Model";
import InputBox from "../widget/InputBox";

function parseMapStr(mapStr){
  if (!mapStr) return '';
  return mapStr.replace('.gat', '');
}

const CharPage = () => {
  const [showLoading,setShowLoading] = useState(false);
  const [showCreate,setShowCreate] = useState(false);
  const [progress,setProgress] = useState(0);
  const [charList,setCharList] = useState([]);
  const [selectCharId,setSelectCharId] = useState(0);
  useEffect(() => {
    if (Char.b_inited==false){
      Char.onConnect=(pkg)=>{
        var charList_t=[]
        for(var i=0;i<pkg.charInfo.length;i++){
          charList_t.push({
            id:pkg.charInfo[i].CharNum,
            name:pkg.charInfo[i].name,
            level:pkg.charInfo[i].level,
            class:StringParser.parseJobStr(pkg.charInfo[i].job),
            map:parseMapStr(pkg.charInfo[i].lastMap)
          })
        }
        setCharList(charList_t);
        setShowLoading(false);
      }
      setShowLoading(true);
      setProgress(30)
      Char.init()
    }
    
  }, []);
  return (
    <div className="char-container">
      {showLoading && <LoadingPage progress={progress} />}
      {
        showCreate && 
        <Model width="400px">
          <InputBox className="char-input" type="text" placeholder="请输入角色名" style={{}}/>
        </Model>
      }
      <div className="char-title">角色列表</div>
        {charList.map((char) => (
        <div className="char-item" key={char.id} onClick={() => {setSelectCharId(char.id)}} style={char.id === selectCharId ? {boxShadow: '4px 4px 20px rgba(208, 147, 114, 0.3)'} : {}}>
          <div className="char-info">
            <div className="info_item_char" style={{fontSize:40}}>{char.name}</div>
              <div className="info_item_char"><span className="info_item_char_label">职业：</span>{char.class}</div>
            </div>
            <div className="char-info">
              <div className="info_item_char"><span className="info_item_char_label">等级：</span>{char.level}</div>
              <div className="info_item_char"><span className="info_item_char_label">地图：</span>{char.map}</div>
            </div>
          </div>
        ))}
      <div className="char_btn_wrap">
        <div className="char_btn" onClick={() => {
          setShowCreate(true);
        }}>新建</div>
        <div className="char_btn" onClick={() => {}}>删除</div>
      </div>
      <div className="char_enter-game" onClick={() => {}}>进入游戏</div>
    </div>
  );
};

export default CharPage;