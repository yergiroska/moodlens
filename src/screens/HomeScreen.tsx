import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeMood } from '../services/groq';
import { saveEntry } from '../services/firestore';
import { GroqAnalysis } from '../types/mood';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

const MOOD_OPTIONS = [
    { emoji: '😊', label: 'Felicidad', color: '#FFD700', hint: 'Me siento feliz' },
    { emoji: '😢', label: 'Tristeza', color: '#4A90D9', hint: 'Me siento triste' },
    { emoji: '😡', label: 'Enojo', color: '#E74C3C', hint: 'Me siento enojado' },
    { emoji: '😰', label: 'Estrés', color: '#F39C12', hint: 'Me siento estresado' },
    { emoji: '😐', label: 'Neutral', color: '#9E9E9E', hint: 'Me siento neutral' },
];

export default function HomeScreen() {
    const [text, setText] = useState('');
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GroqAnalysis | null>(null);
    const [saved, setSaved] = useState(false);
    const { user, signOut } = useAuth();

    const handleSelectMood = (index: number) => {
        setSelectedMood(selectedMood === index ? null : index);
    };

    const handleAnalyze = async () => {
        if (!text.trim() && selectedMood === null) {
            Alert.alert('Error', 'Selecciona una carita o escribe cómo te sientes');
            return;
        }
        try {
            setLoading(true);
            setResult(null);
            setSaved(false);

            const moodHint = selectedMood !== null ? MOOD_OPTIONS[selectedMood].hint : '';
            const combinedText = [moodHint, text.trim()].filter(Boolean).join('. ');

            const analysis = await analyzeMood(combinedText);
            setResult(analysis);

            if (user) {
                await saveEntry({
                    uid: user.uid,
                    text: combinedText,
                    analysis,
                    createdAt: new Date(),
                });
                setSaved(true);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo analizar el texto. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MoodLens 🎭</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>¿Cómo te sientes hoy?</Text>

            <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((mood, index) => (
                    <TouchableOpacity
                        key={mood.label}
                        style={[
                            styles.moodCircle,
                            { backgroundColor: mood.color },
                            selectedMood === index && styles.moodCircleSelected,
                        ]}
                        onPress={() => handleSelectMood(index)}
                    >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selectedMood !== null && (
                <Text style={styles.moodLabel}>{MOOD_OPTIONS[selectedMood].label}</Text>
            )}

            <TextInput
                style={styles.input}
                placeholder="Escribe cómo te sientes... (opcional)"
                placeholderTextColor="#999999"
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
            />

            <TouchableOpacity style={styles.button} onPress={handleAnalyze} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Analizar 🔍</Text>
                )}
            </TouchableOpacity>

            {saved && (
                <Text style={styles.savedText}>✓ Entrada guardada</Text>
            )}

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Resultado del análisis</Text>

                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Emoción principal:</Text>
                        <Text style={styles.resultValue}>{result.emotion}</Text>
                    </View>

                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Intensidad:</Text>
                        <Text style={styles.resultValue}>{result.intensity}/10</Text>
                    </View>

                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Resumen:</Text>
                        <Text style={styles.resultValue}>{result.summary}</Text>
                    </View>

                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Sugerencia:</Text>
                        <Text style={styles.resultValue}>{result.suggestion}</Text>
                    </View>

                    {result.secondary_emotions.length > 0 && (
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Emociones secundarias:</Text>
                            <Text style={styles.resultValue}>{result.secondary_emotions.join(', ')}</Text>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 24,
        paddingTop: 0,
        backgroundColor: colors.background,
        justifyContent: 'center',
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        ...typography.subtitle,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    moodCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
    },
    moodCircleSelected: {
        opacity: 1,
        borderWidth: 3,
        borderColor: colors.text,
    },
    moodEmoji: {
        fontSize: 26,
    },
    moodLabel: {
        ...typography.small,
        color: colors.textSecondary,
        textAlign: 'center',
        width: '100%',
        marginBottom: 16,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        marginBottom: 16,
        minHeight: 120,
        backgroundColor: '#fafafa',
    },
    button: {
        width: '100%',
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        ...typography.body,
        fontWeight: 'bold',
    },
    savedText: {
        color: colors.success,
        ...typography.small,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        width: '100%',
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.primaryBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    resultTitle: {
        ...typography.subtitle,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
    },
    resultRow: {
        marginBottom: 10,
    },
    resultLabel: {
        ...typography.small,
        fontWeight: 'bold',
        color: colors.text,
    },
    resultValue: {
        ...typography.small,
        color: colors.textSecondary,
        marginTop: 2,
    },
    logoutButton: {
        marginTop: 8,
        padding: 8,
    },
    logoutText: {
        color: colors.danger,
        fontWeight: 'bold',
        ...typography.small,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
});