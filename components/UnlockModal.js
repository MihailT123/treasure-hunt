import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function UnlockModal({ visible, setVisible, selectedCache, inputCode, setInputCode, claimTreasure }) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.unlockModal}>
        <View style={styles.unlockContent}>
          <Text style={styles.unlockTitle}>Въведи Кода 🏺</Text>
          {selectedCache?.imageUrl && <Image source={{uri: selectedCache.imageUrl}} style={styles.hintImage} />}
          <TextInput 
            style={styles.unlockInput} 
            placeholder="6-цифрен код" 
            keyboardType="numeric" 
            value={inputCode} 
            onChangeText={setInputCode} 
          />
          <TouchableOpacity style={styles.unlockBtn} onPress={claimTreasure}>
            <Text style={styles.buttonText}>ОТВОРИ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={{color: 'red', marginTop: 10, fontWeight: 'bold'}}>Затвори</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  unlockModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  unlockContent: { width: '80%', backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center' },
  unlockTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  unlockInput: { borderBottomWidth: 2, borderColor: '#e67e22', width: '100%', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  unlockBtn: { backgroundColor: '#2ecc71', padding: 15, width: '100%', borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hintImage: { width: '100%', height: 150, borderRadius: 10, marginBottom: 15 },
});