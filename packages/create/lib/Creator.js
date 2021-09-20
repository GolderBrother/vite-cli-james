const { prompt } = require("inquirer");
const fs = require("fs-extra");
const userhome = require("userhome");
const { promisify } = require("util");
const execa = require("execa");
const glob = promisify(require("glob"));
const clone = promisify(require("clone-git-repo"));
const PromptModuleAPI = require("./PromptModuleAPI");
const GeneratorAPI = require("./GeneratorAPI");
const { isBinaryFile } = require("isbinaryfile");
const { log, config, withLoading, request } = require("@vite1/utils");
const { TEMPLATES } = require("@vite1/settings");
const path = require("path");
const defaultFeaturePrompt = {
  name: "features",
  type: "checkbox",
  message: "请选择项目特性",
  choices: [],
};

class Creator {
  constructor(projectName, projectDir, promptModules = []) {
    this.projectName = projectName; // 项目名称
    this.projectDir = projectDir; // 项目路径
    this.featurePrompt = defaultFeaturePrompt; // 默认选项框
    this.injectPrompt = []; // 插入插入的选择框
    this.promptCompleteCbs = []; // 选择结束之后的回调
    this.plugins = []; // 插件
    this.fileMiddleWares = []; // 文件中间件
    this.files = {}; // 最终输出的文件列表
    this.pkg = {}; // 包描述内容
    this.imports = {}; // 额外的导入语句
    const promptModuleAPI = new PromptModuleAPI(this);
    promptModules.forEach((module) => module(promptModuleAPI));
  }
  // 创建项目
  async create() {
    // 获取选择项
    const projectOptions = (this.projectOptions =
      await this.promptAndResolve());
    console.log("projectOptions", projectOptions);
    // {historyMode: 'browser',appTitle: 'AppTitle'}
    // 准备项目目录
    await this.prepareProjectDir();
    // 下载模板，给templateDir赋值
    await this.downloadTemplate();
    // 把模板拷贝到项目目录中
    await fs.copy(this.templateDir, this.projectDir);
    // 初始化git仓库
    await execa("git", ["init"], {
      cwd: this.projectDir,
      stdio: "inherit",
    });
    // 把开发依赖（devDependencies）写入到package.json文件中
    const pkgPath = path.join(this.projectDir, "package.json");
    const pkg = (this.pkg = await fs.readJSON(pkgPath));
    // 获取开发依赖
    const deps = Reflect.ownKeys(projectOptions.plugins);
    // 将 devDependencies 版本置为最新版
    deps.forEach((dep) => (pkg.devDependencies[dep] = "latest"));
    // 写入到package.json文件中
    await fs.writeJSON(pkgPath, pkg, {
      spaces: 2,
    });
    // 安装依赖
    log.info("vite1", "在 %s 安装依赖...", this.projectDir);
    await execa("npm", ["install"], {
      cwd: this.projectDir,
      stdio: "inherit",
    });
    // 解析插件, 拿到插件的generator方法
    const resolvedPlugins = await this.resolvePlugins(projectOptions.plugins);
    // 应用插件
    await this.applyPlugins(resolvedPlugins);
    await this.initFiles();
    log.info("vite1", "在 %s 安装依赖 successfully", this.projectDir);
  }

  async initFiles() {
    const projectFiles = await glob("**/*", {
      cwd: this.projectDir,
      nodir: true,
    });
    for (const projectFile of projectFiles) {
      const projectFilePath = path.join(this.projectDir, projectFile);
      let content = "";
      if (await isBinaryFile(projectFilePath)) {
        content = await fs.readFile(projectFilePath);
      } else {
        content = await fs.readFile(projectFilePath, "utf8");
      }
      this.files[projectFile] = content;
    }
  }

  // 渲染文件
  async renderFiles() {
    const { files, projectOptions } = this;
    for (const middleware of this.fileMiddlewares) {
      await middleware(files, projectOptions);
    }
    Object.keys(files).forEach((file) => {
      let imports = this.imports[file];
      if (imports && imports.length > 0) {
        files[file] = runTransformation(
          { path: file, source: files[file] },
          require("./codemods/injectImports"),
          { imports }
        );
      }
    });
  }

  // 解析插件
  async resolvePlugins(rawPlugins) {
    const plugins = [];
    for (const id of Reflect.ownKeys(rawPlugins)) {
      const apply = loadModule(`${id}/generator`, this.projectDir);
      let options = rawPlugins[id];
      plugins.push({ id, apply, options });
    }
    return plugins;
  }

  // 应用插件
  async applyPlugins(plugins) {
    for (const plugin of plugins) {
      const { id, apply, options } = plugin;
      const generatorAPI = new GeneratorAPI(id, this, options);
      await apply(generatorAPI, options);
    }
  }

  // 下载模板
  async downloadTemplate() {
    const { GIT_TYPE, ORG_NAME } = config;
    const repos = await withLoading("读取模板列表", async () => {
      request.get(`orgs/${ORG_NAME}/repos`);
    });
    // 选择模板
    const { repo } = await prompt({
      name: "repo",
      type: "list",
      message: "请选择模板",
      choices: repos.map((repo) => repo.name),
    });
    const tags = await withLoading("读取tag列表", async () => {
      request.get(`/repos/${ORG_NAME}/${repo}/tags`);
    });
    // 选择tag
    const { tag } = await prompt({
      name: "tag",
      type: "list",
      message: "请选择版本",
      choices: tags,
    });
    let repository = `${GIT_TYPE}:${ORG_NAME}/${repo}`;
    if (tag) repository += `#${tag}`;
    const downloadDirectory = userhome(TEMPLATES);
    // 拼接要下载到的模板目录
    const templateDir =
      (this.templateDir = `${downloadDirectory}/${repo}/${tag}`);
    log.info("vite1", "准备下载模板到 %s", templateDir);
    try {
      await fs.access(templateDir);
    } catch (error) {
      log.info("vite1", "从仓库下载 %s", repository);
      // clone 仓库
      await clone(repository, templateDir, {
        clone: true,
      });
    }
  }

  // 准备项目目录
  async prepareProjectDir() {
    const { projectDir } = this;
    try {
      // 查看目录是否存在，不存在那就创建
      await fs.access(projectDir);
      const files = await fs.readdir(projectDir);
      if (files.length > 0) {
        const { overwrite } = await prompt({
          type: "confirm",
          name: "overwrite",
          message: "目标目录非空，是否要移除已经存在的目录",
        });
        // 重写就清空目录
        if (overwrite) {
          await fs.emptyDir(projectDir);
        } else {
          throw new Error(`${red("X")}操作被取消`);
        }
      }
    } catch (error) {
      await fs.mkdir(projectDir);
    }
    log.info("vite1", `%s目录已经准备就绪`, projectDir);
  }
  // 解析处理选择项
  async promptAndResolve() {
    const prompts = [this.featurePrompt, ...this.injectPrompt];
    const answers = await prompt(prompts);
    const projectOptions = {
      plugins: [],
    };
    this.promptCompleteCbs.forEach((cb) => cb(answers, projectOptions));
    return projectOptions;
  }
}
module.exports = Creator;
