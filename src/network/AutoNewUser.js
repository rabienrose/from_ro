import Login from "./Login.js";
import Char from "./Char.js";
import Map from "./Map.js";
import EntityManager from "../render/EntityManager.js";
import Entity from "../render/Entity/Entity.js";
import Renderer from "../render/Renderer.js";
import Session from "../utils/SessionStorage.js";
var AutoNewUser={}

function getRandomName(num_len){
  let bytes = new Uint8Array(num_len);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  result = btoa(result);
  return result;
}

AutoNewUser.connected=false;

AutoNewUser.start=function(){
  const savedUsername = localStorage.getItem('username');
  var username = "";
  if (savedUsername){
    username=savedUsername;
  }else{
    username = getRandomName(10);
    username=username+"_F"
  }
  console.log(username);
  var password = 1;

  var char_in_map_cb=()=>{
    Map.init();
  }

  var create_succ_cb=()=>{
    Char.onInMap=char_in_map_cb;
    Char.onConnectRequest(0);
  } 

  var _login_cb = (success,error)=>{
    if (success){
      Char.onConnect=(pkg)=>{
        let entity = new Entity();
        entity._sex = Session.Sex;
        entity.set(pkg.charInfo[0])
        entity.setAction({
					action: entity.ACTION.IDLE,
					frame: 0,
					repeat: true,
					play: true
				});
        console.log(entity);
        EntityManager.add(entity);
        // Renderer.render(EntityManager.render);

        // if (pkg.charInfo.length==0){
        //   var random_name=getRandomName(10);
        //   Char.onCreateSucc = create_succ_cb;
        //   Char.charCreationRequest(random_name,0,0,0,0)
        // }else{
        //   Char.onInMap=char_in_map_cb;
        //   Char.onConnectRequest(0);
        // }
      };
      Char.init();
    }else{
      console.log("login failed: ",error)
    }
  };
  Login.onConnectionRequest( username, password, _login_cb )
}

export default AutoNewUser;