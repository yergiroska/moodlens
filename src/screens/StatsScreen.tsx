import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../services/firestore';
import { MoodEntry } from '../types/mood';
import { getIntensityChartData, getEmotionFrequency } from '../utils/chartHelpers';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
    backgroundColor: '#6C63FF',
    backgroundGradientFrom: '#6C63FF',
    backgroundGradientTo: '#9D97FF',
    decimalPlaces: 0,
    count: 3,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
};

function getColorForEmotion(emotion: string): string {
    const normalized = emotion.toLowerCase().trim();

    const happyWords = ['felicidad', 'alegría', 'alegria', 'contento', 'satisfacción', 'satisfaccion'];
    const sadWords = ['tristeza', 'melancolía', 'melancolia'];
    const angryWords = ['enojo', 'ira', 'rabia', 'furia'];
    const stressedWords = ['estrés', 'estres', 'ansiedad', 'miedo', 'agobio', 'nerviosismo'];
    const neutralWords = ['neutral', 'neutralidad', 'indiferencia', 'apatía', 'apatia'];

    if (happyWords.some((w) => normalized.includes(w))) return '#FFD700';
    if (sadWords.some((w) => normalized.includes(w))) return '#4A90D9';
    if (angryWords.some((w) => normalized.includes(w))) return '#E74C3C';
    if (stressedWords.some((w) => normalized.includes(w))) return '#F39C12';
    if (neutralWords.some((w) => normalized.includes(w))) return '#BDBDBD';

    return '#6B6B6B';
}

export default function StatsScreen() {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [emotionView, setEmotionView] = useState<'bar' | 'pie'>('bar');
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadEntries();
        }
    }, [user]);

    const loadEntries = async () => {
        try {
            const data = await getEntries(user!.uid);
            setEntries(data);
        } catch (error) {
            console.log('Error cargando entradas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    if (entries.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>No hay datos todavía</Text>
                <Text style={styles.emptySubtext}>Escribe cómo te sientes en Hoy</Text>
            </View>
        );
    }

    const intensityData = getIntensityChartData(entries);
    const emotionData = getEmotionFrequency(entries);

    const pieData = emotionData.map((d) => ({
        name: d.emotion,
        population: d.count,
        color: getColorForEmotion(d.emotion),
        legendFontColor: colors.text,
        legendFontSize: 13,
    }));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Estadisticas 📊</Text>

            {intensityData.length > 1 && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Intensidad emocional</Text>
                    <Text style={styles.chartHelp}>
                        Qué tan fuerte sentiste tus emociones cada día (1 = muy leve, 10 = muy intensa).
                    </Text>
                    <LineChart
                        data={{
                            labels: intensityData.map((d) => d.date),
                            datasets: [{ data: intensityData.map((d) => d.intensity) }],
                        }}
                        width={screenWidth}
                        height={180}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </View>
            )}

            {emotionData.length > 0 && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Emociones de la semana</Text>
                    <Text style={styles.chartHelp}>
                        La barra más alta es la emoción que sentiste con más frecuencia.
                    </Text>

                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleButton, emotionView === 'bar' && styles.toggleButtonActive]}
                            onPress={() => setEmotionView('bar')}
                        >
                            <Text style={[styles.toggleText, emotionView === 'bar' && styles.toggleTextActive]}>
                                Barras
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, emotionView === 'pie' && styles.toggleButtonActive]}
                            onPress={() => setEmotionView('pie')}
                        >
                            <Text style={[styles.toggleText, emotionView === 'pie' && styles.toggleTextActive]}>
                                Circular
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {emotionView === 'bar' ? (
                        <BarChart
                            data={{
                                labels: emotionData.map((d) => d.emotion),
                                datasets: [{ data: emotionData.map((d) => d.count) }],
                            }}
                            width={screenWidth}
                            height={270}
                            chartConfig={chartConfig}
                            style={styles.chart}
                            yAxisLabel=""
                            yAxisSuffix=""
                        />
                    ) : (
                        <PieChart
                            data={pieData}
                            width={screenWidth}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="0"
                            style={styles.chart}
                        />
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    title: {
        ...typography.heading,
        color: colors.text,
        marginBottom: 20,
    },
    chartContainer: {
        marginBottom: 24,
    },
    chartTitle: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    chartHelp: {
        ...typography.small,
        color: colors.textMuted,
        marginBottom: 12,
    },
    chart: {
        borderRadius: 16,
    },
    emptyText: {
        ...typography.subtitle,
        fontWeight: 'bold',
        color: colors.text,
    },
    emptySubtext: {
        ...typography.small,
        color: colors.textMuted,
        marginTop: 8,
    },
    toggleRow: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        ...typography.small,
        fontWeight: 'bold',
        color: colors.textMuted,
    },
    toggleTextActive: {
        color: 'white',
    },
});