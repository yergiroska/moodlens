import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeMood } from '../services/groq';
import { GroqAnalysis } from '../types/mood';

export default function HomeScreen() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GroqAnalysis | null>(null);
    const { user, signOut } = useAuth();

    const handleAnalyze = async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Escribe cómo te sientes primero');
            return;
        }
        try {
            setLoading(true);
            setResult(null);
            const analysis = await analyzeMood(text);
            setResult(analysis);
        } catch (error) {
            Alert.alert('Error', 'No se pudo analizar el texto. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>MoodLens 🎭</Text>
            <Text style={styles.subtitle}>¿Cómo te sientes hoy?</Text>

            <TextInput
                style={styles.input}
                placeholder="Escribe cómo te sientes..."
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

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 24,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        minHeight: 120,
    },
    button: {
        width: '100%',
        backgroundColor: '#6C63FF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        width: '100%',
        backgroundColor: '#f8f4ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0d7ff',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6C63FF',
        marginBottom: 12,
    },
    resultRow: {
        marginBottom: 10,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
    },
    resultValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    logoutButton: {
        marginTop: 8,
    },
    logoutText: {
        color: '#FF6B6B',
        fontSize: 14,
    },
});