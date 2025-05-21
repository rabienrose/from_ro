var Globals = {
  // root_ip:"47.111.151.42"
  root_ip:"127.0.0.1"
}

var str_replace_map = {
  "bfa9": "f",
  "b3b2": "m",
  "c3cabab8c0da": "novice",
  "b0cbbbe7": "swordman",
  "b8b6b9fdbbe7": "magician",
  "b1c3bcf6": "archer",
  "bcBac1f7c0da": "acolyte",
  "bbf3c0ce": "merchant",
  "b5b5b5cf": "thief",
  "b0cbb1a4": "trail",
  "b4dcb0cb": "dagger",
  "b0cb": "sword",
  "c3a2": "spear",
  "b5b5b3a2": "axe",
  "c5acb7b4": "mace",
  "b7d4b5e5": "rod",
  "c8b0": "bow",
  "b5b5b6f7c1b7": "doram",
  "c0ceb0a3c1b7": "player",
  "b8d3b8aec5eb":"head",
  "b8f6c5eb":"body",
  "b8f3bdbac5cd":"monster",
  "c0ccc6d1c6ae":"orcish",
  "b9e6c6d0":"shield",
  "b7cebaea":"robe",
  "bec7bcbcbbe7b8ae":"hat",  
}

function convert_2_hex(raw) {
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch.charCodeAt(0) > 127) {
      result += ch.charCodeAt(0).toString(16).padStart(2, "0");
    } else {
      result += ch;
    }
  }
    // if (/^[a-zA-Z0-9\-]$/.test(ch)) {
    //   result += ch;
    // } else {
    //   result += ch.charCodeAt(0).toString(16).padStart(2, "0");
    // }
  return result;
}

Globals.convert_2_readable=(raw)=>{
  let result = [];
  let parts_slash = raw.split("/");
  for (let i = 0; i < parts_slash.length; i++) {
    let parts_underscores = parts_slash[i].split("_");
    let result_underscore = []
    
    for (let j = 0; j < parts_underscores.length; j++) {
      let part = parts_underscores[j];  
      part = convert_2_hex(part);
      // console.log(part)
      if (str_replace_map[part]) {
        result_underscore.push(str_replace_map[part]);
      } else {
        result_underscore.push(part);
      }
      // console.log(result_underscore)
    }
    result.push(result_underscore.join("_"));
  }
  return result.join("/");
}

export default Globals;	
