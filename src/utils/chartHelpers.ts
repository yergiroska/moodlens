import { MoodEntry } from '../types/mood';

export interface ChartDataPoint {
    date: string;
    intensity: number;
    emotion: string;
}

export interface EmotionCount {
    emotion: string;
    count: number;
}

export function getIntensityChartData(entries: MoodEntry[]): ChartDataPoint[] {
    return entries
        .slice(0, 7)
        .reverse()
        .map((entry) => ({
            date: entry.createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            intensity: entry.analysis.intensity,
            emotion: entry.analysis.emotion,
        }));
}

export function getEmotionFrequency(entries: MoodEntry[]): EmotionCount[] {
    const counts: Record<string, number> = {};
    entries.slice(0, 7).forEach((entry) => {
        const emotion = entry.analysis.emotion;
        counts[emotion] = (counts[emotion] || 0) + 1;
    });
    return Object.entries(counts).map(([emotion, count]) => ({ emotion, count }));
}