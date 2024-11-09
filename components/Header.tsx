import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../services/api';
type Props = {
  navigation: StackNavigationProp<any>;
  onProfileImagePress: () => void;
};

interface UserData {
  profilePictureUrl: string;
}

const Header: React.FC<Props> = ({ navigation, onProfileImagePress }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await api.get(`api/users/${userId}`);
        setUserData(response.data);
      }
    };
    getUserData();
  }, []);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onProfileImagePress}>
        <Image
          style={styles.userImage}
          source={{
            uri: userData?.profilePictureUrl,
          }}
        />
      </TouchableOpacity>
      <Text style={styles.title}>GameHub</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '5%',
    paddingRight: '5%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: '800',
  },
});

export default Header;
