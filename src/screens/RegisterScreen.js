import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../auth/AuthContext';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/styles';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      await signOut(auth);
      Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.', [
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      let message = 'Kayıt başarısız';
      if (error.code === 'auth/email-already-in-use') message = 'Bu email zaten kayıtlı';
      else if (error.code === 'auth/invalid-email') message = 'Geçersiz email adresi';
      else if (error.code === 'auth/weak-password') message = 'Şifre çok zayıf';
      Alert.alert('Kayıt Hatası', message);
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
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </Pressable>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={56} color={COLORS.white} />
          </View>
          <Text style={styles.appTitle}>Hesap Oluştur</Text>
          <Text style={styles.appSubtitle}>Sağlık yolculuğuna başla</Text>
        </LinearGradient>

        <View style={styles.form}>
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
              placeholder="Şifre (en az 6 karakter)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.textLight}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textLight} />
            </Pressable>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Şifreyi tekrarla"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient colors={['#4A90E2', '#2C6FBF']} style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={styles.linkButton}>
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{' '}
              <Text style={styles.linkBold}>Giriş Yap</Text>
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
    paddingTop: 50,
    paddingBottom: 36,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    padding: SPACING.sm,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appTitle: {
    fontSize: 26,
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
  input: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },
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
  buttonText: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', padding: SPACING.sm },
  linkText: { fontSize: FONT_SIZE.md, color: COLORS.textLight },
  linkBold: { color: COLORS.primary, fontWeight: 'bold' },
});

export default RegisterScreen;
