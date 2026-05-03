import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator, Image, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';
import ImagePickerModal from '../components/ImagePickerModal';

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function AuthScreen() {
  const [authScreen, setAuthScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const pickImage = () => {
    setImagePickerVisible(true);
  };

  const handleCamera = async () => {
    setImagePickerVisible(false);
    let r = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!r.canceled) setProfileImage(r.assets[0].uri);
  };

  const handleGallery = async () => {
    setImagePickerVisible(false);
    let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
    if (!r.canceled) setProfileImage(r.assets[0].uri);
  };

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert("Внимание!", "Трябва да попълните всички полета за регистрация!");
    if (authScreen === 'register' && password.length < 6) {
      return Alert.alert("Внимание!", "Паролата ви трябва да съдържа поне 6 символа!");
    }
    setLoading(true);
    try {
      if (authScreen === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!username) {
          setLoading(false);
          return Alert.alert("Внимание!", "Трябва да попълните всички полета за регистрация!");
        }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), {
          username: username,
          email: email,
          profilePic: profileImage || DEFAULT_AVATAR,
          totalScore: 0,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      Alert.alert("Невалиден email или парола!", "Моля опитайте пак.");
    } finally { setLoading(false); }
  };

  return (
    <ImageBackground 
      source={require('../loadingscreen.gif')} 
      style={styles.authBackground}
      blurRadius={5}
    >
      <View style={styles.authOverlay}>
        <Text style={styles.authTitle}>Treasure FindR</Text>
        
        {authScreen === 'register' && (
            <TouchableOpacity onPress={pickImage} style={{alignSelf: 'center', marginBottom: 20}}>
                <Image source={{uri: profileImage || DEFAULT_AVATAR}} style={styles.bigAvatar} />
            </TouchableOpacity>
        )}
        {authScreen === 'register' && <TextInput style={styles.authInput} placeholder="Профилно име" placeholderTextColor="#999" value={username} onChangeText={setUsername} />}
        
        <TextInput style={styles.authInput} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.authInput} placeholder="Парола" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry />
        
        <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading}>
           {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>{authScreen === 'login' ? "ВХОД" : "РЕГИСТРАЦИЯ"}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setAuthScreen(authScreen === 'login' ? 'register' : 'login')}>
          <Text style={styles.switchAuthText}>
              {authScreen === 'login' ? "Нямаш профил? Регистрирай се тук!" : "Вече имаш профил? Натисни тук за вход!"}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ImagePickerModal 
        visible={imagePickerVisible} 
        setVisible={setImagePickerVisible}
        onPickCamera={handleCamera}
        onPickGallery={handleGallery}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  authBackground: { flex: 1, width: '100%', height: '100%', justifyContent: 'center' },
  authOverlay: { flex: 1, justifyContent: 'center', padding: 40, backgroundColor: 'rgba(0,0,0,0.4)' },
  authTitle: { fontSize: 45, fontWeight: '900', textAlign: 'center', marginBottom: 40, color: '#fff', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
  authInput: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2, fontSize: 16 },
  authButton: { backgroundColor: '#e67e22', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchAuthText: { color: '#fff', marginTop: 20, textAlign: 'center', fontSize: 15, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 5 },
  bigAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 3, borderColor: '#e67e22' },
});