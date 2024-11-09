/* eslint-disable prettier/prettier */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
 // Para os ícones

const GameHubScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Fs2F8U1KRXpToUDd_5GIP1t49MAMU3D0ywGV9I2Iiiu5PzeAf35dcwpl_ng2NS3YPUA&usqp=CAU' }} // URL de exemplo para a imagem de perfil
          style={styles.profileImage}
        />
        <Text style={styles.title}>GameHub</Text>
      </View>

      {/* Parte onde será os jogos que o user tem interesse */}
      <Text style={styles.question}>O que você quer jogar hoje?</Text>

      <View style={styles.gamesRow}>
        <Image source={{ uri: '../assets/gameIcons/gtaV' }} style={styles.gameIcon} />
        <Image source={{ uri: '../assets/gameIcons/fortnite.png' }} style={styles.gameIcon} />
        <Image source={{ uri: '../assets/gameIcons/cs2.png' }} style={styles.gameIcon} />
        <Image source={{ uri: '../assets/gameIcons/valorant.png' }} style={styles.gameIcon} />
      </View>

      {/* Feed de posts */}
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <Text style={styles.postUsername}>@carlin</Text>
        </View>
        <Text style={styles.postText}>Namoral n tô acreditando q fiz isso kkk</Text>
        <Image
          source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FHnDGegt6PXY%2Fmaxresdefault.jpg&f=1&nofb=1&ipt=397a19280b767374860dce72d42513d31b1dfe83d713fa25fc64b1a43719bac2&ipo=images' }} // Imagem do Post
          style={styles.postImage}
        />
        <View style={styles.postActions}>
          <Text style={styles.postAction}>💬 180</Text>
          <Text style={styles.postAction}>❤️ 79</Text>
        </View>
        <Text style={styles.postTime}>Há 5h</Text>
      </View>

      {/* Post 2 */}
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <Text style={styles.postUsername}>@Luc4sM0ur4</Text>
        </View>
        <Text style={styles.postText}>Vamos de FIFA 2024</Text>
        <Image
          source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffiles.mmopixel.com%2Ftinymce%2Fdf6fb906-4b73-4422-a95e-9495a196e47d.jpeg&f=1&nofb=1&ipt=5c7ca12a4591898fdbe99c6753b876bf3f2adfc0cceb738f44f0af30c5e3edb0&ipo=images' }}
          style={styles.postImage}
        />
        <View style={styles.postActions}>
          <Text style={styles.postAction}>💬 560</Text>
          <Text style={styles.postAction}>❤️ 150</Text>
        </View>
        <Text style={styles.postTime}>Há 12h</Text>
      </View>

      {/* Espaço-bar */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="compass-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="mail-outline" size={24} color="black" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  question: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  post: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUsername: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postText: {
    color: '#fff',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  postAction: {
    color: '#fff',
  },
  postTime: {
    color: '#888',
    fontSize: 12,
  },
  // Parte da estilização do Espaço-Bar
  actionButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#D1E7F8', // Fundo azul claro
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
    width: '60%',
    alignSelf: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED', // Bolinha roxa da Notificação
  },
});

export default GameHubScreen;
