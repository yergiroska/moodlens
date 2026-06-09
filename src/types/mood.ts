export interface GroqAnalysis {
    emotion: string;
    intensity: number;
    summary: string;
    suggestion: string;
    secondary_emotions: string[];
}

export interface MoodEntry {
    id?: string;
    uid: string;
    text: string;
    analysis: GroqAnalysis;
    createdAt: Date;
}