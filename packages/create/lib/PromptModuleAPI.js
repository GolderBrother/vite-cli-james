class PromptModuleAPI {
    constructor(creator) {
        this.creator = creator;
    }
    //插入特性
    injectFeature(feature) {
        this.creator.featurePrompt.choices.push(feature);
    //插入选项
    }
    injectPrompt(prompt) {
        this.creator.injectPrompt.push(prompt);
    }
    //选择完成后的回调
    onPromptComplete(cb) {
        this.creator.promptCompleteCbs.push(cb);
    }
}
module.exports = PromptModuleAPI;