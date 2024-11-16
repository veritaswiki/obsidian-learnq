import { LingQAPI } from '../services/lingq-api';

export interface PluginState {
    isInitialized: boolean;
    apiKey: string;
    language: string;
    lastSync?: Date;
    error?: string;
}

export class PluginStateManager {
    private state: PluginState;
    private api: LingQAPI | null = null;

    constructor(initialState: Partial<PluginState> = {}) {
        this.state = {
            isInitialized: false,
            apiKey: '',
            language: 'en',
            ...initialState
        };
    }

    async initialize(apiKey: string, language: string): Promise<boolean> {
        this.state.apiKey = apiKey;
        this.state.language = language;
        
        try {
            this.api = new LingQAPI(apiKey);
            const isValid = await this.api.validateApiKey();
            
            if (isValid) {
                this.state.isInitialized = true;
                this.state.error = undefined;
                return true;
            } else {
                this.state.error = 'Invalid API key';
                return false;
            }
        } catch (error) {
            this.state.error = error instanceof Error ? error.message : 'Unknown error';
            return false;
        }
    }

    async sendToLingQ(text: string, title?: string): Promise<boolean> {
        if (!this.api || !this.state.isInitialized) {
            throw new Error('Plugin not initialized');
        }

        const response = await this.api.createLesson(
            this.state.language,
            title || `Note from Obsidian - ${new Date().toLocaleString()}`,
            text
        );

        if (response.success) {
            this.state.lastSync = new Date();
            return true;
        }

        this.state.error = response.message || 'Failed to send to LingQ';
        return false;
    }

    getState(): PluginState {
        return { ...this.state };
    }

    getError(): string | undefined {
        return this.state.error;
    }

    clearError(): void {
        this.state.error = undefined;
    }
}
