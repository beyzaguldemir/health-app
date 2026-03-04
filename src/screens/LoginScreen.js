import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../auth/AuthContext';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/styles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Hata', 'Email ve şifre giriniz');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      let message = 'Giriş başarısız';
      if (error.code === 'auth/user-not-found') message = 'Kullanıcı bulunamadı';
      else if (error.code === 'auth/wrong-password') message = 'Yanlış şifre';
      else if (error.code === 'auth/invalid-email') message = 'Geçersiz email adresi';
      else if (error.code === 'auth/invalid-credential') message = 'Email veya şifre hatalı';
      Alert.alert('Giriş Hatası', message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#4A90E2', '#7BB8F7']} style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="heart-circle" size={72} color={COLORS.white} />
          </View>
          <Text style={styles.appTitle}>Sağlık Takibi</Text>
          <Text style={styles.appSubtitle}>Kişisel AI sağlık asistanınız</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Hoş Geldiniz</Text>
          <Text style={styles.formSubtitle}>Hesabınıza giriş yapın</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email adresiniz"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Şifreniz"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.textLight}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textLight}
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Giriş Yap</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
            <Text style={styles.linkText}>
              Hesabın yok mu?{' '}
              <Text style={styles.linkBold}>Kayıt Ol</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  appSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.85)',
  },
  form: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  formTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 52,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  eyeIcon: { padding: SPACING.xs },
  button: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  linkButton: { alignItems: 'center', padding: SPACING.sm },
  linkText: { fontSize: FONT_SIZE.md, color: COLORS.textLight },
  linkBold: { color: COLORS.primary, fontWeight: 'bold' },
});

export default LoginScreen;
