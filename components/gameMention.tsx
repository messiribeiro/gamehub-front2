import React, { useEffect, useRef, useState} from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const GameMention: React.FC<CustomAlertProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200, // Duração da animação
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300, // Duração da animação
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSearchIconPress = () => {
    setIsSearchActive(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertContainer, { opacity }]}>
          <Text style={styles.title}>Mencione algum jogo</Text>
          <TouchableOpacity style={styles.searchBar} onPress={handleSearchIconPress}>
                  <Text style={styles.searchTitle}>O que você quer jogar hoje?</Text>
                  <Feather name="search" type="feather" size={20} color="#fff" />
                </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '60%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#2B2B2C',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },

  searchTitle: {
    color: 'white',
    fontSize: 17,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  searchInput: {
    color: 'white',
    fontSize: 17,
  },
});

export default GameMention;
