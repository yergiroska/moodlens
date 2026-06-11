import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../services/firestore';
import { MoodEntry } from '../types/mood';
import { getIntensityChartData, getEmotionFrequency } from '../utils/chartHelpers';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
    backgroundColor: '#6C63FF',
    backgroundGradientFrom: '#6C63FF',
    backgroundGradientTo: '#9D97FF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
};

export default function HistoryScreen() {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);
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
                <Text style={styles.emptyText}>No hay entradas todavía</Text>
                <Text style={styles.emptySubtext}>Escribe cómo te sientes en Home</Text>
            </View>
        );
    }

    const intensityData = getIntensityChartData(entries);
    const emotionData = getEmotionFrequency(entries);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Mi historial 📖</Text>

            {intensityData.length > 1 && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Intensidad emocional</Text>
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
                    <BarChart
                        data={{
                            labels: emotionData.map((d) => d.emotion.substring(0, 5)),
                            datasets: [{ data: emotionData.map((d) => d.count) }],
                        }}
                        width={screenWidth}
                        height={180}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        yAxisLabel=""
                        yAxisSuffix=""
                    />
                </View>
            )}

            <Text style={styles.sectionTitle}>Entradas recientes</Text>
            {entries.map((item) => (
                <View key={item.id || item.createdAt.toString()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.emotion}>{item.analysis.emotion}</Text>
                        <Text style={styles.intensity}>{item.analysis.intensity}/10</Text>
                    </View>
                    <Text style={styles.date}>
                        {item.createdAt.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </Text>
                    <Text style={styles.text} numberOfLines={2}>{item.text}</Text>
                    <Text style={styles.summary}>{item.analysis.summary}</Text>
                </View>
            ))}
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
        marginBottom: 8,
    },
    chart: {
        borderRadius: 16,
    },
    sectionTitle: {
        ...typography.subtitle,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.text,
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
    card: {
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.primaryBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    emotion: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'capitalize',
    },
    intensity: {
        ...typography.small,
        fontWeight: 'bold',
        color: colors.primary,
    },
    date: {
        ...typography.tiny,
        color: colors.textMuted,
        marginBottom: 8,
    },
    text: {
        ...typography.small,
        color: colors.text,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    summary: {
        ...typography.small,
        color: colors.textSecondary,
    },
});