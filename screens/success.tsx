import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button} from 'react-native';


import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Subscribe'>;

const Success = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento realizado com sucesso!</Text>
      <Button title="Voltar para a Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Success;
