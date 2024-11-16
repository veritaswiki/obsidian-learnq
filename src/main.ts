import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PluginStateManager } from './models/plugin-state';

interface LingQSettings {
    apiKey: string;
    language: string;
}

const DEFAULT_SETTINGS: LingQSettings = {
    apiKey: '',
    language: 'en'
}

export default class LingQPlugin extends Plugin {
    settings: LingQSettings;
    private stateManager: PluginStateManager;

    async onload() {
        await this.loadSettings();
        this.stateManager = new PluginStateManager({
            apiKey: this.settings.apiKey,
            language: this.settings.language
        });

        // 初始化插件状态
        if (this.settings.apiKey) {
            await this.initializePlugin();
        }

        // 添加右键菜单
        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                const selection = editor.getSelection();
                if (selection) {
                    menu.addItem((item) => {
                        item
                            .setTitle('Send to LingQ')
                            .setIcon('book')
                            .onClick(async () => {
                                await this.sendToLingQ(selection);
                            });
                    });
                }
            })
        );

        // 添加命令
        this.addCommand({
            id: 'send-to-lingq',
            name: 'Send selection to LingQ',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const selection = editor.getSelection();
                if (selection) {
                    await this.sendToLingQ(selection);
                } else {
                    new Notice('No text selected');
                }
            }
        });

        // 添加设置标签页
        this.addSettingTab(new LingQSettingTab(this.app, this));
    }

    private async initializePlugin(): Promise<void> {
        const success = await this.stateManager.initialize(
            this.settings.apiKey,
            this.settings.language
        );

        if (!success) {
            const error = this.stateManager.getError();
            new Notice(`Failed to initialize plugin: ${error}`);
        }
    }

    private async sendToLingQ(text: string): Promise<void> {
        try {
            const success = await this.stateManager.sendToLingQ(text);
            if (success) {
                new Notice('Successfully sent to LingQ');
            } else {
                const error = this.stateManager.getError();
                new Notice(`Failed to send to LingQ: ${error}`);
            }
        } catch (error) {
            new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    onunload() {
        // 清理工作
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // 当设置更新时重新初始化插件
        await this.initializePlugin();
    }
}

class LingQSettingTab extends PluginSettingTab {
    plugin: LingQPlugin;

    constructor(app: App, plugin: LingQPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        containerEl.createEl('h2', {text: 'LingQ Settings'});

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Your LingQ API key')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Language')
            .setDesc('Target language for learning')
            .addDropdown(dropdown => dropdown
                .addOption('en', 'English')
                .addOption('es', 'Spanish')
                .addOption('fr', 'French')
                .addOption('de', 'German')
                .addOption('ja', 'Japanese')
                .addOption('zh', 'Chinese')
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                }));
    }
}