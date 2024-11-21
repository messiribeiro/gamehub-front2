import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { RootStackParamList } from '../../navigation';

type Props = StackScreenProps<RootStackParamList, 'Settings'>;

const Settings = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      {/* Configurações */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('MyGames')}>
          <MaterialIcons name="sports-esports" size={20} color="#fff" />
          <Text style={styles.optionText}>Meus jogos</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfile', {profilePictureUri: null})}>
          <MaterialIcons name="person" size={20} color="#fff" />
          <Text style={styles.optionText}>Editar Perfil</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} >
          <Feather name="key" size={20} color="#fff" />
          <Text style={styles.optionText}>Alterar Senha</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} >
          <Feather name="alert-circle" size={20} color="#fff" />
          <Text style={styles.optionText}>Desativar conta</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    paddingTop: '3%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
});

export default Settings;
