import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function BottomMenu({
  menuVisible, setMenuVisible,
  activeTab, setActiveTab,
  username, profileImage, score,
  myRank, foundCachesCount, progressPercent,
  leaderboard,
  treasureImage, isUploading,
  pickImage, handleHideTreasure,
  treasureComment, setTreasureComment
}) {
  return (
    <Modal visible={menuVisible} animationType="slide" transparent={true}>
      <View style={styles.menuModal}>
        <View style={styles.menuContent}>
          <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeMenu}>
            <Ionicons name="chevron-down" size={30} color="#bdc3c7" />
          </TouchableOpacity>

          <ScrollView style={{flex: 1, width: '100%', paddingHorizontal: 20}}>
            {activeTab === 'add' && (
              <View style={{alignItems: 'center', paddingTop: 20}}>
                <Text style={styles.tabTitle}>Скрий Съкровище</Text>
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerBig}>
                  {treasureImage ? <Image source={{uri: treasureImage}} style={styles.fullImg}/> : <Ionicons name="camera" size={40} color="#bdc3c7"/>}
                </TouchableOpacity>
                <TextInput style={styles.commentInput} placeholder="Остави подсказка" placeholderTextColor="#999" value={treasureComment} onChangeText={setTreasureComment} maxLength={60}/>
                <TouchableOpacity style={styles.hideBtn} onPress={handleHideTreasure} disabled={isUploading}>
                  <Text style={styles.buttonText}>{isUploading ? "Качва се..." : "СКРИЙ ТУК"}</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'account' && (
              <View style={styles.accountTab}>
                <Image source={{uri: profileImage || DEFAULT_AVATAR}} style={styles.bigAvatar} />
                <Text style={styles.username}>{username}</Text>
                <Text style={{fontSize: 18, color: '#e67e22', fontWeight: 'bold'}}>Точки: {score} 🏆</Text>
                
                <View style={styles.statsContainer}>
                  <Text style={styles.statText}>Ранг в Лидерборда: #{myRank > 0 ? myRank : '?'}</Text>
                  <Text style={styles.statText}>Намерени съкровища: {foundCachesCount}</Text>
                  <Text style={styles.statText}>Прогрес до намиране на всички: {progressPercent}%</Text>
                </View>
              </View>
            )}

            {activeTab === 'scoreboard' && (
              <View style={{ width: '100%', paddingTop: 10 }}>
                <Text style={styles.tabTitle}>Глобален Ранкинг</Text>
                {leaderboard.map((player, index) => (
                  <View key={player.id} style={styles.leaderboardRow}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                    <Image source={{uri: player.profilePic || DEFAULT_AVATAR}} style={styles.smallAvatar} />
                    <Text style={styles.playerName}>{player.username}</Text>
                    <Text style={styles.playerScore}>{player.totalScore || 0} pts</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.tabsFooter}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('add')}>
              <Ionicons name="add-circle" size={26} color={activeTab === 'add' ? '#e67e22' : '#bdc3c7'}/>
              <Text style={[styles.tabLabel, {color: activeTab === 'add' ? '#e67e22' : '#bdc3c7'}]}>Добави</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('account')}>
              <Ionicons name="person" size={26} color={activeTab === 'account' ? '#e67e22' : '#bdc3c7'}/>
              <Text style={[styles.tabLabel, {color: activeTab === 'account' ? '#e67e22' : '#bdc3c7'}]}>Акаунт</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('scoreboard')}>
              <Ionicons name="trophy" size={26} color={activeTab === 'scoreboard' ? '#e67e22' : '#bdc3c7'}/>
              <Text style={[styles.tabLabel, {color: activeTab === 'scoreboard' ? '#e67e22' : '#bdc3c7'}]}>Ранкинг</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  menuContent: { height: '80%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  closeMenu: { padding: 10, width: '100%', alignItems: 'center' },
  tabsFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', paddingBottom: 30 },
  tabBtn: { alignItems: 'center' },
  tabLabel: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  bigAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 3, borderColor: '#e67e22' },
  username: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  accountTab: { alignItems: 'center', paddingTop: 10 },
  statsContainer: { marginTop: 20, alignItems: 'flex-start', backgroundColor: '#f5f6fa', padding: 20, borderRadius: 15, width: '100%' },
  statText: { fontSize: 16, color: '#2c3e50', marginBottom: 10, fontWeight: '500' },
  tabTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  imagePickerBig: { width: '100%', height: 200, backgroundColor: '#f5f6fa', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  fullImg: { width: '100%', height: '100%' },
  hideBtn: { backgroundColor: '#e67e22', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f6fa', padding: 15, borderRadius: 15, marginBottom: 10 },
  rankNumber: { fontSize: 18, fontWeight: 'bold', color: '#e67e22', width: 40 },
  smallAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  playerName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  playerScore: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },
  commentInput: { width: '100%', backgroundColor: '#f5f6fa', padding: 15, borderRadius: 15, marginBottom: 20, fontSize: 16, color: '#2c3e50' },
});