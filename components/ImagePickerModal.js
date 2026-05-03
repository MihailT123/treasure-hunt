import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ImagePickerModal({ visible, setVisible, onPickCamera, onPickGallery }) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Добави снимка</Text>
          
          <TouchableOpacity style={styles.optionBtn} onPress={onPickCamera}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.optionText}>Камера</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionBtn} onPress={onPickGallery}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.optionText}>Галерия</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
            <Text style={styles.cancelText}>Отказ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 25, borderRadius: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  optionBtn: { flexDirection: 'row', backgroundColor: '#e67e22', padding: 15, borderRadius: 15, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  optionText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  cancelBtn: { padding: 10, marginTop: 5 },
  cancelText: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold' }
});