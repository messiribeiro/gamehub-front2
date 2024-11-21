import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api';

import { RootStackParamList } from '../../navigation';
import { FlatList, TextInput } from 'react-native-gesture-handler';

type Props = StackScreenProps<RootStackParamList, 'AddReward'>;


const AddReward = ({ navigation }: Props) => {
  return (

    <View style={styles.container} >
      <StatusBar backgroundColor="#1B1B1E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar recompensa</Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.messageText} >Os doadores que já contribuíram com o valor escolhido para essa nova recompensa irão recebê-la automaticamente, sem necessidade de fazer uma nova doação."</Text>
        <View style={styles.form} > 
        <View style={styles.amountInputContainer} >
            <Text style={styles.inputLabelText} >Valor mínimo para a recompensa</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Descreva sua recompensa"
              placeholderTextColor="#888"
              multiline={true}
            />
          </View>

          <View style={styles.descriptionInputContainer} >
            <Text style={styles.inputLabelText} >Descrição</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Descreva sua recompensa"
              placeholderTextColor="#888"
              multiline={true}
            />
          </View>
          
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={()=> {navigation.navigate("AddReward")}} >
          <Text style={styles.buttonText} >Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>


  )
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
    marginBottom: 40,
    zIndex: 10
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

  messageText: {
    color: "white",
    fontSize: 15,
    fontWeight: "300",

  },

  main: {
    paddingHorizontal: "5%",
    
  },
  inputLabelText: {
    color: "white",
    fontSize: 15,
  },
  descriptionInputContainer: {
    marginTop: 30
  },
  form: {
    marginTop: 50
  },
  descriptionInput: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    backgroundColor: '#333',
    textAlignVertical: 'top',
    borderRadius: 8,
    padding: 10,
    height: 130
  },

  amountInput: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    backgroundColor: '#333',
    textAlignVertical: 'top',
    borderRadius: 8,
    padding: 10,
    height: 50
  },

  amountInputContainer: {

  },

  footer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
  },
  button: {
    backgroundColor: "#5312C2",
    width: "90%",
    height: 45,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },

  


});

export default AddReward;