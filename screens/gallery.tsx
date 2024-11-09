import { StackScreenProps } from '@react-navigation/stack';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';

import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Feather} from '@expo/vector-icons';

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Galery'>;

const Gallery = ({ navigation, route }: Props) => {
  const { isProfilePicture } = route.params;
  const [media, setMedia] = useState<MediaLibrary.Asset[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [after, setAfter] = useState<MediaLibrary.AssetRef | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await loadMedia();
      } else {
        console.log('Permissão não concedida');
      }
    })();
  }, []);

  const loadMedia = async () => {
    if (loading || !hasNext) return;

    setLoading(true);
    try {
      const mediaList = await MediaLibrary.getAssetsAsync({
        first: 200,
        mediaType: isProfilePicture
          ? [MediaLibrary.MediaType.photo]
          : [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: MediaLibrary.SortBy.creationTime,
        after,
      });

      if (mediaList.assets.length > 0) {
        console.log('Assets loaded:', mediaList.assets); // Log de depuração
        setMedia((prevMedia) => [...prevMedia, ...mediaList.assets]);
        setAfter(mediaList.assets[mediaList.assets.length - 1].id);
      }

      setHasNext(mediaList.hasNextPage);
    } catch (error) {
      console.error('Erro ao carregar a mídia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadMedia();
    }
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isImage = item.mediaType === 'photo';

    // Função para lidar com o toque na imagem
    const handlePress = () => {
      if (isProfilePicture) {
        navigation.navigate('EditProfile', {
          profilePictureUri: item.uri,
        });
      } else {
        navigation.navigate('EditPostInfo', {
          photoUri: item.uri,
          cameraType: isImage ? 'front' : 'back', // ou qualquer lógica que você queira
        });
      }
    };

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={handlePress} style={styles.imageContainer}>
          <Image source={{ uri: item.uri }} style={styles.thumbnail} />
          {/* Mostra o ícone apenas se não for uma imagem de perfil */}
          {!isProfilePicture && (
            <Feather name={isImage ? 'image' : 'video'} size={24} color="#fff" style={styles.icon} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text style={styles.text}>Imagens da galeria</Text>
      <FlatList
        style={styles.flatList}
        data={media}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : null
        }
        contentContainerStyle={styles.flatList}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>Nenhuma mídia encontrada.</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 2,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1B1B1E',
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 2,
    marginHorizontal: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    resizeMode: 'cover',
  },
  icon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  flatList: {
    paddingHorizontal: 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    height: Dimensions.get('window').height,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Gallery;
