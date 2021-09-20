const path = require("path");
const fs = require("fs-extra");
function writeFileTree(projectDir, files) {
  Object.entries(files).forEach(([file, content]) => {
    // 获取 ejs 的文件名
    if (file.endsWith(".ejs")) file = file.slice(0, -4);
    const filePath = path.join(projectDir, file);
    // 先确保文件所在的目录是存在
    fs.ensureDirSync(path.dirname(filePath));
    // 存在就写进去
    fs.writeFileSync(filePath, content);
  });
}

module.exports = writeFileTree;
