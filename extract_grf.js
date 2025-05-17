import { GrfNode } from "@chicowall/grf-loader";
import fs from "fs";
import path from "path";

var extract_root = process.cwd()

async function init() {
  const filePath = path.join(process.cwd(), "data.grf");
  console.log(filePath)
  const fd = fs.openSync(filePath, "r");
  var grf = new GrfNode(fd);
  await grf.load();
  for (const [grf_filename, value] of grf.files) {
    var filename = grf_filename.replace(/\\/g, '\/');
    // console.log("filename", filename)
    const {data, error} = await grf.getFile(grf_filename);
    var data_content= Buffer.from(data);
    // console.log(data_content)	
    let localPath = path.join(extract_root, filename);
    console.log(localPath)
    const extractDir = path.dirname(localPath);
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    fs.writeFileSync(localPath, data_content);
  }
}

await init();


