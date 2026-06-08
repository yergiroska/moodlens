import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    link: {
        fontSize: 16,
        color: 'blue',
    },
});