import { Feather } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

type Props = {
  navigation: StackNavigationProp<any>;
};

const TabMenu: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Feather name="compass" size={26} color="#000000" />
      </TouchableOpacity>

      <TouchableOpacity>
        <Feather
          name="plus-circle"
          onPress={() => navigation.navigate('Camera')}
          size={26}
          color="#000000"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
        <Feather name="mail" size={26} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 50,
    backgroundColor: '#D4E5FF',
    borderRadius: 30,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default TabMenu;
