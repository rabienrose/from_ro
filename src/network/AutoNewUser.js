import Login from "./Login.js";
import Char from "./Char.js";
import Map from "./Map.js";
import EntityManager from "../render/EntityManager.js";
import Entity from "../render/entity/Entity.js";
import Renderer from "../render/Renderer.js";
import Session from "../utils/SessionStorage.js";
import BGM from "../audio/BGM.js";
var AutoNewUser={}

function getRandomName(num_len){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < num_len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
var temp_username = "";
AutoNewUser.connected=false;

AutoNewUser.start=function(){
  AutoNewUser.setProgress(0.1);
  Renderer.init(); 
  BGM.initHTML5();  
  const savedUsername = localStorage.getItem('username');
  var username = "";
  if (savedUsername){
    username=savedUsername;
  }else{
    username = getRandomName(10);
    temp_username=username;
    const sexSuffix = Math.random() < 0.5 ? "_F" : "_M";
    username = username + sexSuffix;
  }
  var password = 1;

  var char_in_map_cb=()=>{
    AutoNewUser.setProgress(0.2);
    Map.onEnterMap=AutoNewUser.onEnterMap;
    Map.setProgress=AutoNewUser.setProgress;
    Map.init();
  }

  var create_succ_cb=(pkg)=>{
    AutoNewUser.setProgress(0.8);
    let entity = new Entity();
    entity._sex = Session.Sex;
    entity.set(pkg.charinfo)
    Char.onInMap=char_in_map_cb;
    Char.onConnectRequest(entity);
  } 

  var _login_cb = (success,error)=>{
    if (success){

      Char.onConnect=(pkg)=>{
        if (pkg.charInfo.length==0){
          localStorage.setItem('username', temp_username);
          var random_name=getRandomName(10);
          Char.onCreateSucc = create_succ_cb;
          var random_color = Math.floor(Math.random() * 9);
          var random_hair = Math.floor(Math.random() * 13);
          Char.charCreationRequest(random_name,random_hair,random_color,0,0)
        }else{
          let entity = new Entity();
          entity._sex = Session.Sex;
          entity.set(pkg.charInfo[0])
          entity.setAction({
            action: entity.ACTION.IDLE,
            frame: 0,
            repeat: true,
            play: true
          });
          Char.onInMap=char_in_map_cb;
          Char.onConnectRequest(entity);
        }
      };
      Char.init();
    }else{
      console.log("login failed: ",error)
    }
  };
  Login.onConnectionRequest( username, password, _login_cb )
}

export default AutoNewUser;