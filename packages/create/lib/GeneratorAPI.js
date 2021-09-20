const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const { isBinaryFile } = require("isbinaryfile");
const { promisify } = require("util");
const { runTransformation } = require("vue-codemod");
const glob = promisify(require("glob"));
const { extractCallDir, isString } = require("@vite1/utils");
async function renderFile(templatePath, projectOptions) {
    // 如果是二进制文件，直接读取返回文件内容
    if (await isBinaryFile(templatePath)) return fs.readFileSync(templatePath);
    const template = fs.readFileSync(templatePath, 'utf8');
    return ejs.render(template, projectOptions)
}
class GeneratorAPI {
  constructor(id, creator, projectOptions) {
    this.id = id;
    this.creator = creator;
    this.projectOptions = projectOptions;
  }
  // 插入文件处理中间件
  async _injectFileMiddleware(middleware) {
    this.creator.fileMiddleWares.push(middleware);
  }
  // 渲染拷贝文件
  async render(source) {
    const baseDir = extractCallDir();
    if (isString(source)) {
      source = path.resolve(baseDir, source);
      await this._injectFileMiddleware(async (files, projectOptions) => {
        // glob("**/*")： 匹配所有目录下的所有文件
        const templateFiles = await glob("**/*", {
          cwd: source,
          nodir: true, // 忽略目录
        });
        for (const templateFile of templateFiles) {
          files[templateFile] = await renderFile(
            path.resolve(source, templateFile),
            projectOptions
          );
        }
      });
    }
  }
  // 扩展依赖包
  extendPackage(toMerge) {
    const { pkg } = this.creator;
    for (const key in toMerge) {
      if (!Object.hasOwnProperty.call(toMerge, key)) continue;
      const value = toMerge[key];
      const existing = pkg[key];
      // 存在就合并
      if (
        isObject(value) &&
        ["dependencies", "devDependencies"].includes(key)
      ) {
        pkg[key] = mergeDeps(existing || {}, value);
      } else {
        pkg[key] = value;
      }
    }
  }
  // 转译脚本
  transformScript(file, codemod, projectOptions = {}) {
    this._injectFileMiddleware((files) => {
      // 将文件内容转换成AST
      files[file] = runTransformation(
        {
          path: file,
          source: files[file],
        },
        codemod,
        projectOptions
      );
    });
  }
  // 插入导入语句
  injectImport(file, newImport) {
    const imports = (this.creator.imports[file] = this.creator.imports[file] || []);
    imports.push(newImport);
  }
  // 入口文件的路径
  get entryFile() {
      return 'src/index.js';
  }
}
