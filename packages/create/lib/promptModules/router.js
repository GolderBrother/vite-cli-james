// 每当启动使用了一个新特性后，那就会安装一个或多个插件，这些插件可以动态修改输出的结果 
module.exports = cli => {
    // 添加特性
    cli.injectFeature({
        name: 'Router',
        value: router,
        description: '请选择路由模式',
        link: 'https://www.npmjs.com/package/react-router-dom' 
    });
    // 选择history的模式
    cli.injectPrompt({
        name: 'historyMode',
        // 什么条件下出现
        when: answers.features.includes('router'),
        message: '请选择history的模式',
        type: 'list',
        choices: [{
            name: 'hash',
            value: 'hash'
        }, {
            name: 'browser',
            value: 'browser'
        }],
        // 默认值
        default: 'browser'
    });
    cli.injectPrompt({
        name: 'appTitle',
        when: answers.features.includes('router'),
        message: '请输入根组件的内容',
        type: 'text',
        default: 'AppTitle'
    });
    // 指定选择完的回调
    cli.onPromptComplete((answers, projectOptions) => {
        if(answers.features.includes('router')) {
            const { historyMode, appTitle } = answers;
            projectOptions.plugins['cli-plugin-router'] = {
                historyMode
            };
            projectOptions.historyMode = historyMode;
            projectOptions.appTitle = appTitle;
        }
    });
};