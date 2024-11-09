import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import ImagePreview from '../components/ImagePreview';
import VideoPreview from '../components/VideoPreview';
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Album } from 'expo-media-library';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
  Button,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Camera'>;

const CameraScreen = ({ navigation, route }: Props) => {
  const { isProfilePicture } = route.params || { isProfilePicture: false };
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState(false);
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
    getAlbums();
    setPhoto(null);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setPhoto(null);
      getAlbums();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Home'); // Replace 'Home' with your desired fallback screen
        }
        return true;
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  const requestMicrophonePermission = async () => {
    const { granted } = await Camera.requestMicrophonePermissionsAsync();
    if (!granted) {
      Alert.alert('Permissão de áudio', 'Permissão de áudio necessária para gravação de vídeo.');
    }
    setAudioPermission(granted);
  };

  const checkPermissions = async () => {
    if (!cameraPermission || !cameraPermission.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão da câmera para continuar.');
      }
    }

    // Solicitar permissão de mídia (áudio)
    await requestMicrophonePermission();

    const { status: audioStatus } = await MediaLibrary.requestPermissionsAsync();
    if (audioStatus === 'granted') {
      setAudioPermission(true);
    } else {
      Alert.alert(
        'Permissão de áudio necessária',
        'Precisamos da permissão de áudio para gravar vídeos.'
      );
    }
  };

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos da sua permissão para mostrar a câmera</Text>
        <Button onPress={requestCameraPermission} title="Conceder Permissão" />
      </View>
    );
  }

  async function getAlbums() {
    if (permissionResponse?.status !== 'granted') {
      await requestMediaPermission();
    }

    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    setAlbums(fetchedAlbums);

    const assets = await MediaLibrary.getAssetsAsync({
      first: 1,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType.photo,
    });

    if (assets.assets.length > 0) {
      setLastPhotoUri(assets.assets[0].uri);
    }
  }

  function toggleCameraFacing() {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      if (isVideoMode) {
        if (!isRecording) {
          if (!audioPermission) {
            Alert.alert('Erro', 'Permissão de áudio não concedida. Não é possível gravar vídeos.');
            return;
          }

          console.log('Iniciando a gravação de vídeo...');
          setIsRecording(true);
          try {
            const video = await cameraRef.current.recordAsync();
            if (video && video.uri) {
              console.log('Vídeo gravado em:', video.uri);
              setVideoUri(video.uri);
            } else {
              console.error('Vídeo não gravado, objeto vídeo é indefinido ou não contém URI');
            }
          } catch (error) {
            console.error('Erro ao gravar o vídeo:', error);
          } finally {
            setIsRecording(false);
          }
        } else {
          console.log('Parando a gravação de vídeo...');
          cameraRef.current.stopRecording();
          setIsRecording(false);
        }
      } else {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo && photo.uri) {
          console.log(photo.uri);
          setLastPhotoUri(photo.uri);
          setPhoto(photo.uri);
        } else {
          console.error('Falha ao tirar foto');
        }
      }
    }
  }

  const handleBack = () => {
    setPhoto(null);
    setVideoUri(null);
  };

  function handleForward() {
    const uriToSend = isVideoMode && videoUri ? videoUri : photo;

    if (isProfilePicture) {
      navigation.navigate('EditProfile', {
        profilePictureUri: uriToSend || 'erro',
      });
    } else {
      navigation.navigate('EditPostInfo', {
        photoUri: uriToSend || 'erro',
        cameraType: facing,
      });
    }
  }

  return (
    <View style={styles.container}>
      {videoUri ? (
        <VideoPreview
          VideoUri={videoUri}
          onBack={handleBack}
          onForward={handleForward}
          cameraFacing={facing}
        />
      ) : photo ? (
        <ImagePreview
          imageUri={photo}
          onBack={handleBack}
          onForward={handleForward}
          cameraFacing={facing}
        />
      ) : (
        <>
          <StatusBar hidden />
          <CameraView
            mode={isVideoMode ? 'video' : 'picture'}
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
            autofocus="on">
            <View style={styles.screenContainer}>
              <View style={styles.changeModeContainer}>
                {!isProfilePicture && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setIsVideoMode(false);
                        console.log('Modo foto ativado');
                      }}>
                      <Text style={[styles.text, !isVideoMode && styles.textSelected]}>Foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsVideoMode(true);
                        console.log('Modo vídeo ativado');
                      }}>
                      <Text style={[styles.text, isVideoMode && styles.textSelected]}>Vídeo</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.lastImage}
                  onPress={() => {
                    if (isProfilePicture) {
                      navigation.navigate('Galery', { isProfilePicture: true });
                    } else navigation.navigate('Galery', { isProfilePicture: false });
                  }}>
                  {lastPhotoUri ? (
                    <Image source={{ uri: lastPhotoUri }} style={styles.lastImage} />
                  ) : (
                    <View style={styles.placeholderImage} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={isRecording ? styles.recordingButton : styles.takePhotoButton}
                  onPress={takePicture}>
                  {isRecording ? <View style={styles.squareButton} /> : null}
                </TouchableOpacity>
                <TouchableOpacity style={styles.toggleFacingButton} onPress={toggleCameraFacing}>
                  <Feather name="rotate-ccw" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {},
  camera: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
    flexDirection: 'row',
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  takePhotoButton: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleFacingButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  lastImage: {
    width: 50,
    height: 50,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontWeight: '300',
  },
  textSelected: {
    fontWeight: '700',
  },
  changeModeContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
    justifyContent: 'center',
  },
  recordingButton: {
    width: 80,
    height: 80,
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareButton: {
    width: 25,
    height: 25,
    backgroundColor: 'red',
    position: 'absolute',
    borderRadius: 5,
  },
});

export default CameraScreen;
