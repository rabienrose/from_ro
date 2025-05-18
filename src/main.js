
import print_d from './utils/Debug.js';
import FileManager from './network/FileManager.js';
import MapLoader from './network/MapLoader.js';
import Renderer from './render/Renderer.js';
import MapRenderer from './render/MapRenderer.js';  
let test_type=2;
FileManager.remoteClient = 'http://localhost:8001';
if(test_type==0){
  FileManager.load('/sprite/cursors.spr')
    .then(spr => {
        console.log(spr);
      var canvas = spr.getCanvasFromFrame(0);
      document.body.appendChild(canvas);
    });
}else if(test_type==1){
    MapLoader.load('cmd_fild03.rsw');
}else if(test_type==2){
    Renderer.init();
    Renderer.show();
}
