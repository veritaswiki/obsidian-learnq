interface LingQResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export class LingQAPI {
    private apiKey: string;
    private baseUrl = 'https://www.lingq.com/api/v2';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request(endpoint: string, options: RequestInit): Promise<LingQResponse> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('LingQ API error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async createLesson(language: string, title: string, text: string): Promise<LingQResponse> {
        return this.request(`/languages/${language}/lessons/`, {
            method: 'POST',
            body: JSON.stringify({
                title,
                text,
                share_status: 'private',
                source_url: '',
                original_url: '',
            }),
        });
    }

    async getLanguages(): Promise<LingQResponse> {
        return this.request('/languages/', {
            method: 'GET'
        });
    }

    async getUserInfo(): Promise<LingQResponse> {
        return this.request('/me/', {
            method: 'GET'
        });
    }

    async validateApiKey(): Promise<boolean> {
        const response = await this.getUserInfo();
        return response.success;
    }
}
