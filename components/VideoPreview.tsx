import { Feather } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { CameraType } from 'expo-camera';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import GoBackAlert from './GoBackAlert';

interface VideoPreviewProps {
  VideoUri: string;
  onBack: () => void; // Assegure-se de que isso esteja sendo passado corretamente
  onForward: () => void;
  cameraFacing: CameraType;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  VideoUri,
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
    console.log('Voltando para a tela anterior...'); // Debugging
    setAlertVisible(false);
    onBack(); // Aqui chama a função onBack passada como prop
  };

  const VideoTransform = cameraFacing === 'front' ? [{ scaleX: -1 }] : [];

  return (
    <View style={styles.VideoPreviewContainer}>
      <Video
        source={{ uri: VideoUri }}
        style={[styles.VideoPreview, { transform: VideoTransform }]}
        shouldPlay // Inicia a reprodução do vídeo automaticamente
        resizeMode={ResizeMode.COVER} // Ajusta o vídeo para caber no contêiner sem cortar
        isLooping // O vídeo ficará em loop
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
        title="Descartar vídeo?"
        message="Você perderá o vídeo criado."
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
  VideoPreviewContainer: {
    flex: 1,
  },
  VideoPreview: {
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

export default VideoPreview;
