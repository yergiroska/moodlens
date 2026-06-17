import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Por favor rellena todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        try {
            setLoading(true);
            await signUp(email, password);
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la cuenta. Intenta con otro email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MoodLens 🎭</Text>
            <Text style={styles.subtitle}>Crear cuenta</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Registrarse</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: colors.background,
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        ...typography.subtitle,
        color: colors.textSecondary,
        marginBottom: 32,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fafafa',
        color: '#000000',
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
    link: {
        color: colors.primary,
        ...typography.small,
    },
});