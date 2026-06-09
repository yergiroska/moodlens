import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../services/firestore';
import { MoodEntry } from '../types/mood';

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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mi historial 📖</Text>
            <FlatList
                data={entries}
                keyExtractor={(item) => item.id || item.createdAt.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
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
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 60,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#f8f4ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0d7ff',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    emotion: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6C63FF',
        textTransform: 'capitalize',
    },
    intensity: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6C63FF',
    },
    date: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    summary: {
        fontSize: 14,
        color: '#666',
    },
});