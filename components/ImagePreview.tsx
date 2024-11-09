import { Feather } from '@expo/vector-icons';
import { CameraType } from 'expo-camera';
import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';

import GoBackAlert from './GoBackAlert';

interface ImagePreviewProps {
  imageUri: string;
  onBack: () => void;
  onForward: () => void;
  cameraFacing: CameraType;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUri,
  onBack,
  onForward,
  cameraFacing,
}) => {
  const [isAlertVisible, setAlertVisible] = useState(false);

  const handleBackPress = () => {
    setAlertVisible(true);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  const handleConfirmBack = () => {
    setAlertVisible(false);
    onBack();
  };

  const imageTransform = cameraFacing === 'front' ? [{ scaleX: -1 }] : [];

  return (
    <View style={styles.imagePreviewContainer}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.imagePreview, { transform: imageTransform }]}
      />
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.forwardButton} onPress={onForward}>
          <Text style={styles.text}>Avançar</Text>
        </TouchableOpacity>
      </View>

      <GoBackAlert
        visible={isAlertVisible}
        onClose={handleCloseAlert}
        onConfirm={handleConfirmBack}
        title="Descartar Imagem?"
        message="você perderá a imagem criada"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 20,
  },
  imagePreviewContainer: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  forwardButton: {
    width: 130,
    height: 50,
    backgroundColor: '#5312C2',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
});

export default ImagePreview;
