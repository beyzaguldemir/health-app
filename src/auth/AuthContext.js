import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile } from '../firebase/userService';
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const result = await getUserProfile(u.uid);
        setUserProfile(result.success ? result.data : null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    try {
      setUserProfile(null);
      setUser(null);
      await signOut(auth);
    } catch (error) {
      console.log('Çıkış hatası:', error.message);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const result = await getUserProfile(user.uid);
      setUserProfile(result.success ? result.data : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
