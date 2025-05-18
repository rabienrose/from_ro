import { GrfNode } from "@chicowall/grf-loader";
import fs from "fs";
import path from "path";
import Globals from "./src/utils/Globals.js";  

var extract_root = process.cwd()

async function init() {
  const filePath = path.join(process.cwd(), "data.grf");
  console.log(filePath)
  const fd = fs.openSync(filePath, "r");
  var grf = new GrfNode(fd);
  await grf.load();
  for (const [grf_filename, value] of grf.files) {
    var filename = grf_filename.replace(/\\/g, '\/');
    const ext = path.extname(filename);
    
    if ([".gat", ".gnd", ".rsw"].includes(ext)) {
      filename = "data/maps/" + filename.slice(5);
    }
    filename=Globals.convert_2_readable(filename);

    // console.log("grf_filename", grf_filename)
    // console.log("filename", filename)

    const {data, error} = await grf.getFile(grf_filename);
    var data_content= Buffer.from(data);
    let localPath = path.join(extract_root,filename);
    const extractDir = path.dirname(localPath);
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    fs.writeFileSync(localPath, data_content);
  }
}

await init();


