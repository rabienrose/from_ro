import SPR from './network/Sprite.js';
import ACT from './network/Action.js';
import STR from './network/Str.js';
import RSW from './network/World.js';
import RSM from './network/Model.js';
import print_d from './utils/Debug.js';

let test_type=5;

if(test_type==0){
    let data = fetch('./resources/sprite/cursors.spr').then(res => res.arrayBuffer());
    data.then(data => {
        const spr = new SPR();
        spr.load(data);
        var canvas = spr.getCanvasFromFrame(0);
        document.body.appendChild(canvas);
    });
}else if(test_type==1){
    let data = fetch('./resources/sprite/cursors.act').then(res => res.arrayBuffer());
    data.then(data => {
        const act = new ACT();
        act.load(data);
        console.log(act.compile());
    });
}else if(test_type==2){
    let data = fetch('./resources/effect/windhit1.str').then(res => res.arrayBuffer());
    data.then(data => {
        const str = new STR();
        str.load(data);
        console.log(str);
    });
}else if(test_type==3){
    let data = fetch('./resources/maps/cmd_fild03.rsw').then(res => res.arrayBuffer());
    data.then(data => {
        const rsw = new RSW();
        rsw.load(data);
        console.log(rsw.compile());
    });
}else if(test_type==4){
    let data = fetch('./resources/model/¿ò¹ß¶ó/¿ò¹ß¶ó-ºøÀÚ·ç.rsm').then(res => res.arrayBuffer());
    data.then(data => {
        const rsm = new RSM();
        rsm.load(data);
        console.log(rsm);
    });
}else if(test_type==5){
    let s="¿ò¹ß¶ó/¿ò¹ß¶ó-ºøÀÚ·ç";
    let encoder = new TextEncoder();
    let uint8Array = encoder.encode(s);
    console.log(uint8Array);
    print_d(uint8Array);

}

