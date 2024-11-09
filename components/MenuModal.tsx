import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {MaterialIcons} from '@expo/vector-icons';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  BackHandler,
  PanResponder, // Importar PanResponder
} from 'react-native';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  userData: any;
  userStats: any;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MenuModal: React.FC<MenuProps> = ({ visible, onClose, navigation, userData, userStats }) => {
  const slideAnim = React.useRef(new Animated.Value(-screenWidth)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        // Detectar movimento de deslizar para a esquerda
        if (gestureState.dx < -10) {
          // Alterar o valor para ajustar a sensibilidade
          onClose(); // Fecha o menu
        }
      },
    })
  ).current;

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose(); // Fecha o menu se estiver visível
        return true; // Impede que o aplicativo feche
      }
      return false; // Permite que o comportamento padrão ocorra se o menu não estiver visível
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Limpa o listener ao desmontar
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      navigation.replace('Login');
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isPremium = userData?.Subscription?.isActive;
  console.log(isPremium)

  return (
    <Animated.View
      {...panResponder.panHandlers} // Adicionar panHandlers aqui
      style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('MyProfile');
        }}
        style={styles.header}>
        <Image
          source={{ uri: userData?.profilePictureUrl }}
          style={styles.userImage}
          onError={() => console.error('Erro ao carregar imagem do perfil')}
        />

      <View style={styles.userData}>
        <View style={styles.usernameContainer} >
            <Text style={styles.username}>
              {userData?.username || '@Usuário'}
            </Text>
            {isPremium && (
              <MaterialIcons name="verified" size={16} color="#FFC000" style={styles.verifiedIcon} />
            )}
        </View>
        
        <View style={styles.status}>
          <View style={styles.circle} />
          <Text style={styles.statusText}>online</Text>
        </View>
      </View>
      </TouchableOpacity>

      <View style={styles.follows}>
        <Text style={styles.followers}>{userStats?.followingCount || 0} seguindo</Text>
        <Text style={styles.following}>{userStats?.followersCount || 0} seguidores</Text>
      </View>

      <View style={styles.premiumContainer}>
        <Text style={styles.title}>
          {isPremium ? 'Plano atual: GameDev' : 'Seja um usuário premium'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(isPremium ? 'Dashboard' : 'Subscribe');
          }}
          style={styles.gameDev}>
          <Feather name="code" size={20} color="#fff" />
          <Text style={styles.text}>{isPremium ? 'Dashboard' : 'GameDev'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pagesAndLogoutContainer}>
        <TouchableOpacity style={styles.logoutView} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#fff" />
          <Text style={styles.text}>Sair</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: screenHeight + 1000,
    width: '80%',
    backgroundColor: '#101010',
    padding: 20,
    paddingTop: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 10,
  },
  followers: {
    color: 'white',
    fontSize: 15,
  },
  following: {
    color: 'white',
    fontSize: 15,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  userData: {},
  username: {
    color: 'white',
    fontSize: 15,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  circle: {
    width: 10,
    height: 10,
    backgroundColor: '#36C929',
    borderRadius: 50,
    top: 1,
  },
  follows: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  premiumContainer: {
    marginTop: 30,
    gap: 10,
  },
  text: {
    color: 'white',
    fontSize: 15,
  },
  statusText: {
    color: 'white',
  },
  gameDev: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  pagesAndLogoutContainer: {
    marginTop: '30%',
    gap: 15,
  },
  logoutView: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  verifiedIcon: {
    marginLeft: 5, // Um pequeno espaço entre o nome e o ícone
    alignSelf: 'center', // Alinha verticalmente com o texto
    top: 1
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  }
});

export default MenuModal;
