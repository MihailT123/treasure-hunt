import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { getDistance } from 'geolib';
import { db, auth } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { dayStyle, nightStyle } from './mapStyles';

import AuthScreen from './screens/AuthScreen';
import FloatingParticle from './components/FloatingParticle';
import UnlockModal from './components/UnlockModal';
import BottomMenu from './components/BottomMenu';
import ImagePickerModal from './components/ImagePickerModal';

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [caches, setCaches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]); 
  const [score, setScore] = useState(0);
  const [isNight, setIsNight] = useState(new Date().getHours() >= 20 || new Date().getHours() <= 6);
  const [activeTab, setActiveTab] = useState('add'); 
  
  const slideAnim = useRef(new Animated.Value(200)).current; 
  const [isInRange, setIsInRange] = useState(false);
  const [currentCacheScore, setCurrentCacheScore] = useState(50);
  const [particles, setParticles] = useState([]);
  const timerRef = useRef(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [foundModalVisible, setFoundModalVisible] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [selectedCache, setSelectedCache] = useState(null);
  const [treasureImage, setTreasureImage] = useState(null);
  const [treasureComment, setTreasureComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setScore(userDoc.data().totalScore || 0);
          setUsername(userDoc.data().username || currentUser.email.split('@')[0]);
          setProfileImage(userDoc.data().profilePic || DEFAULT_AVATAR); 
        }
        setUser(currentUser);
      } else { 
        setUser(null); 
        setUsername('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      usersData.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      setLeaderboard(usersData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let locationSub = null;
    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert("Внимание!", "Без достъп до локацията няма как да играеш! Отидини в настройките и дай разрешение.");
      locationSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => setLocation(loc.coords)
      );
    };
    startTracking();
    return () => { if (locationSub) locationSub.remove(); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "geocaches"), (snapshot) => {
      setCaches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!location || !selectedCache) return;
    const dist = getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: selectedCache.location.latitude, longitude: selectedCache.location.longitude }
    );
    if (dist > 15 && isInRange) {
      stopPointBleed();
      setSelectedCache(null);
      Alert.alert("Излезе от радиуса. Трябва да цъкнеш съкровището пак!");
    }
  }, [location, selectedCache, isInRange]);

  useEffect(() => {
    const lockScreen = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    lockScreen();
  }, []);

  useEffect(() => {
    if (isTracking && location && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: location.latitude, longitude: location.longitude },
        heading: location.heading || 0, 
      }, { duration: 1000 });
    }
  }, [location, isTracking]);

  const startPointBleed = () => {
    setCurrentCacheScore(50);
    clearInterval(timerRef.current); 
    timerRef.current = setInterval(() => {
      setCurrentCacheScore(prev => {
        if (prev <= 25) return prev; 
        setParticles(p => [...p, { id: Date.now() + Math.random() }]); 
        return prev - 1;
      });
    }, 30000); 
  };

  const stopPointBleed = () => {
    setIsInRange(false);
    clearInterval(timerRef.current);
    Animated.timing(slideAnim, { toValue: 200, duration: 500, useNativeDriver: true }).start();
  };

  const pickImage = () => {
    setImagePickerVisible(true);
  };

  const handleCamera = async () => {
    setImagePickerVisible(false);
    let r = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!r.canceled) setTreasureImage(r.assets[0].uri);
  };

  const handleGallery = async () => {
    setImagePickerVisible(false);
    let r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
    if (!r.canceled) setTreasureImage(r.assets[0].uri);
  };

  const handleMarkerPress = (cache) => {
    if (cache.creator === user.email) return Alert.alert("Твое съкровище!", "Това е съкровище което ти си скрил.");
    if (cache.finders?.includes(user.email)) {
        const dateFound = cache.foundDates?.[user.uid] || "преди време";
        return Alert.alert("Намерено съкровище!", `Ти вече си намерил това съкровище на ${dateFound} .`);
    }

    const dist = getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: cache.location.latitude, longitude: cache.location.longitude }
    );

    if (dist > 15) return Alert.alert("Твърде си далече от съкровището!", `Остават ${dist} метра докато го стигнеш.`);

    if (selectedCache?.id !== cache.id) {
      setSelectedCache(cache);
      setIsInRange(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 5 }).start();
      startPointBleed();
    }
  };

  const handleHideTreasure = async () => {
    if (!location) return;
    setIsUploading(true);
    try {
      const addressData = await Location.reverseGeocodeAsync(location);
      const addr = addressData[0];
      const fullAddress = `${addr.street || 'Street'} ${addr.name || ''}, ${addr.city}`;
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await addDoc(collection(db, "geocaches"), {
        location: { latitude: location.latitude, longitude: location.longitude },
        address: fullAddress,
        code: code,
        creator: user.email,
        creatorUsername: username,
        imageUrl: treasureImage,
        comment: treasureComment,
        finders: [],
        foundDates: {}, 
        createdAt: serverTimestamp()
      });
      Alert.alert("Съкровището е скрито!", `Кодът ти е: ${code}`);
      setTreasureImage(null);
      setMenuVisible(false);
    } catch (e) { Alert.alert("Error", "Нещо се прецака."); }
    finally { setIsUploading(false); }
  };

  const claimTreasure = async () => {
    if (inputCode.trim() === selectedCache.code.toString()) {
      stopPointBleed();
      try {
        const todayStr = new Date().toLocaleDateString('bg-BG'); 
        const cacheRef = doc(db, "geocaches", selectedCache.id);
        
        await updateDoc(cacheRef, { 
            finders: arrayUnion(user.email),
            [`foundDates.${user.uid}`]: todayStr 
        });
        
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { totalScore: score + currentCacheScore }, { merge: true });
        
        setScore(s => s + currentCacheScore);
        Alert.alert("Браво!", `Взе ${currentCacheScore} точки!`);
        setFoundModalVisible(false);
        setInputCode('');
        setSelectedCache(null); 
      } catch(e) { Alert.alert("Грешка при запис."); }
    } else { Alert.alert("Внимание!", "Грешен код!"); }
  };

  const centerMap = () => {
    setIsTracking(true); 
    if (location && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: location.latitude, longitude: location.longitude },
        heading: location.heading || 0,
        zoom: 18
      }, { duration: 1000 });
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#e67e22" /></View>;
  if (!user) return <AuthScreen />;

  const myRank = leaderboard.findIndex(p => p.email === user.email) + 1;
  const findableCaches = caches.filter(c => c.creator !== user.email); 
  const foundCachesCount = caches.filter(c => c.finders?.includes(user.email)).length;
  const progressPercent = findableCaches.length > 0 ? Math.round((foundCachesCount / findableCaches.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isNight ? nightStyle : dayStyle}
        showsUserLocation={true}
        showsMyLocationButton={false} 
        showsCompass={false}          
        toolbarEnabled={false}
        onPanDrag={() => setIsTracking(false)}        
      >
       {caches.map(c => {
         let pinIcon = c.creator === user.email ? require('./yourTreasure.png') 
                     : c.finders?.includes(user.email) ? require('./foundTreasure.png') 
                     : require('./hiddenTreasure.png');

         return (
           <Marker 
             key={c.id} 
             coordinate={{ latitude: c.location.latitude, longitude: c.location.longitude }}
             onPress={() => handleMarkerPress(c)}
           >
             <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
               <Image source={pinIcon} style={{width: '100%', height: '100%', resizeMode: 'contain'}} />
             </View>
           </Marker>
         );
       })}
      </MapView>

      <TouchableOpacity style={styles.topBtnLeft} onPress={() => signOut(auth)}>
        <Ionicons name="log-out" size={28} color="#2c3e50" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.topBtnRight} onPress={centerMap}>
        <Ionicons name="compass" size={35} color="#e67e22" />
      </TouchableOpacity>

      <Animated.View style={[styles.hudSlideContainer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.scoreCircleSlide}>
          <Text style={styles.hudLabelSlide}>POINTS</Text>
          <Text style={styles.hudValueSlide}>{currentCacheScore}</Text>
          {particles.map(p => (
            <FloatingParticle key={p.id} onComplete={() => setParticles(ps => ps.filter(x => x.id !== p.id))} />
          ))}
        </View>
        <TouchableOpacity style={styles.timerCircleSlide} onPress={() => setFoundModalVisible(true)}>
          <Text style={styles.hudLabelSlide}>UNLOCK</Text>
          <Ionicons name="lock-open" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomTabContainer}>
        <TouchableOpacity style={styles.tabHandle} onPress={() => setMenuVisible(true)}>
          <Ionicons name="chevron-up" size={30} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <BottomMenu 
        menuVisible={menuVisible} setMenuVisible={setMenuVisible}
        activeTab={activeTab} setActiveTab={setActiveTab}
        username={username} profileImage={profileImage} score={score}
        myRank={myRank} foundCachesCount={foundCachesCount} progressPercent={progressPercent}
        leaderboard={leaderboard}
        treasureImage={treasureImage} isUploading={isUploading}
        pickImage={pickImage} handleHideTreasure={handleHideTreasure}
        treasureComment={treasureComment} setTreasureComment={setTreasureComment}
      />

      <UnlockModal 
        visible={foundModalVisible} setVisible={setFoundModalVisible}
        selectedCache={selectedCache}
        inputCode={inputCode} setInputCode={setInputCode}
        claimTreasure={claimTreasure}
      />

      <ImagePickerModal 
        visible={imagePickerVisible} 
        setVisible={setImagePickerVisible}
        onPickCamera={handleCamera}
        onPickGallery={handleGallery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  hudSlideContainer: { position: 'absolute', right: 20, bottom: 120, alignItems: 'center' }, 
  scoreCircleSlide: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(44, 62, 80, 0.9)', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#e67e22' },
  timerCircleSlide: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e67e22', justifyContent: 'center', alignItems: 'center', elevation: 10 },
  hudLabelSlide: { color: '#bdc3c7', fontSize: 10, fontWeight: 'bold' },
  hudValueSlide: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  topBtnLeft: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 10, elevation: 5 },
  topBtnRight: { position: 'absolute', top: 50, right: 20, backgroundColor: '#fff', padding: 5, borderRadius: 50, elevation: 5 },
  
  bottomTabContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  tabHandle: { backgroundColor: '#fff', padding: 10, borderRadius: 30, elevation: 5 },
});