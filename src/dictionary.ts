export interface DictionaryEntry {
    word: string;
    definition: string;
    examples: string[];
}

export class Dictionary {
    private entries: Map<string, DictionaryEntry>;

    constructor() {
        this.entries = new Map();
    }

    addEntry(entry: DictionaryEntry) {
        this.entries.set(entry.word.toLowerCase(), entry);
    }

    getEntry(word: string): DictionaryEntry | undefined {
        return this.entries.get(word.toLowerCase());
    }

    hasEntry(word: string): boolean {
        return this.entries.has(word.toLowerCase());
    }

    getAllEntries(): DictionaryEntry[] {
        return Array.from(this.entries.values());
    }

    removeEntry(word: string) {
        this.entries.delete(word.toLowerCase());
    }
}