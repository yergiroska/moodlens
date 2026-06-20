import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../services/firestore';
import { MoodEntry } from '../types/mood';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

function getEmojiForEmotion(emotion: string): string | null {
    const normalized = emotion.toLowerCase().trim();

    const happyWords = ['felicidad', 'alegría', 'alegria', 'contento', 'satisfacción', 'satisfaccion'];
    const sadWords = ['tristeza', 'melancolía', 'melancolia'];
    const angryWords = ['enojo', 'ira', 'rabia', 'furia'];
    const stressedWords = ['estrés', 'estres', 'ansiedad', 'miedo', 'agobio', 'nerviosismo'];
    const neutralWords = ['neutral', 'neutralidad', 'indiferencia', 'apatía', 'apatia'];

    if (happyWords.some((w) => normalized.includes(w))) return '😊';
    if (sadWords.some((w) => normalized.includes(w))) return '😢';
    if (angryWords.some((w) => normalized.includes(w))) return '😡';
    if (stressedWords.some((w) => normalized.includes(w))) return '😰';
    if (neutralWords.some((w) => normalized.includes(w))) return '😐';

    return '❓';
}

export default function HistoryScreen() {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Mi historial 📖</Text>

            <Text style={styles.sectionTitle}>Entradas recientes</Text>
            {entries.map((item) => (
                <TouchableOpacity
                    key={item.id || item.createdAt.toString()}
                    style={styles.card}
                    onPress={() => setSelectedEntry(item)}
                    activeOpacity={0.7}
                >
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
                </TouchableOpacity>
            ))}

            <Modal
                visible={selectedEntry !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedEntry(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedEntry(null)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        {selectedEntry && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalEmotionRow}>
                                    {getEmojiForEmotion(selectedEntry.analysis.emotion) && (
                                        <Text style={styles.modalEmoji}>
                                            {getEmojiForEmotion(selectedEntry.analysis.emotion)}
                                        </Text>
                                    )}
                                    <Text style={styles.modalEmotion}>{selectedEntry.analysis.emotion}</Text>
                                </View>
                                <Text style={styles.modalDate}>
                                    {selectedEntry.createdAt.toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>

                                <Text style={styles.modalText}>{selectedEntry.text}</Text>

                                <View style={styles.modalRow}>
                                    <Text style={styles.modalLabel}>Intensidad:</Text>
                                    <Text style={styles.modalValue}>{selectedEntry.analysis.intensity}/10</Text>
                                </View>

                                <View style={styles.modalRow}>
                                    <Text style={styles.modalLabel}>Resumen:</Text>
                                    <Text style={styles.modalValue}>{selectedEntry.analysis.summary}</Text>
                                </View>

                                {selectedEntry.analysis.suggestion && (
                                    <View style={styles.modalRow}>
                                        <Text style={styles.modalLabel}>Sugerencia:</Text>
                                        <Text style={styles.modalValue}>{selectedEntry.analysis.suggestion}</Text>
                                    </View>
                                )}

                                {selectedEntry.analysis.secondary_emotions && selectedEntry.analysis.secondary_emotions.length > 0 && (
                                    <View style={styles.modalRow}>
                                        <Text style={styles.modalLabel}>Emociones secundarias:</Text>
                                        <Text style={styles.modalValue}>
                                            {selectedEntry.analysis.secondary_emotions.join(', ')}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: 24,
        padding: 24,
        paddingTop: 16,
        maxHeight: '80%',
        width: '100%',
    },
    modalText: {
        ...typography.body,
        color: colors.text,
        fontStyle: 'italic',
        fontWeight: '600',
        marginBottom: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    closeButtonText: {
        fontSize: 18,
        color: colors.text,
        fontWeight: 'bold',
    },
    modalEmotionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalEmoji: {
        fontSize: 28,
        marginRight: 8,
    },
    modalEmotion: {
        ...typography.heading,
        color: colors.primary,
        textTransform: 'capitalize',
    },
    modalDate: {
        ...typography.small,
        color: colors.textMuted,
        marginBottom: 20,
    },
    modalRow: {
        marginBottom: 16,
    },
    modalLabel: {
        ...typography.small,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    modalValue: {
        ...typography.small,
        color: colors.textSecondary,
    },
});