/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import TabMenu from '../components/TabMenu';
import { Video, ResizeMode as VideoResizeMode } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import api from '../services/api';
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';

interface UserData {
  id: number;
  username: string;
  profilePictureUrl: string;
  bio: string | null;
  Subscription: {
    type: string;
    isActive: boolean;
  };
}

interface UserStats {
  followersCount: number;
  followingCount: number;
}

interface Game {
  id: number;
  name: string;
  gameimageUrl: string | null;
}

interface Post {
  id: number;
  content: string;
  imageUrl: string;
  authorId: number;
  createdAt: string;
}

// Defining the type of props
type Props = StackScreenProps<RootStackParamList, 'MyProfile'>;

const MyProfile: React.FC<Props> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userGames, setUserGames] = useState<Game[]>([]); // State for user games
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [posts, setPosts] = useState<Post[]>([]); // State for user posts
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  const getUserData = async () => {
    const profileUserId = await AsyncStorage.getItem("userId");

    const userResponse = await api.get(`api/users/${profileUserId}`);
    setUserData(userResponse.data);

    // Fetch user stats
    const statsResponse = await api.get(`api/friendships/stats/${profileUserId}`);
    setUserStats(statsResponse.data);
    
    // Fetch user games
    const gamesResponse = await api.get(`api/games/user/${profileUserId}`);
    setUserGames(gamesResponse.data);

    // Fetch user posts
    const postsResponse = await api.get(`api/post/user/${profileUserId}`);
    setPosts(postsResponse.data);
    
    setLoading(false); 
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {profilePictureUri: null});
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getUserData().finally(() => setRefreshing(false)); // Refetch user data and stop refreshing
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#121212" />

        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const renderPost = ({ item }: { item: Post }) => {
    const isVideo = item.imageUrl.endsWith('.mp4');

    return (
      <View style={styles.post}>
        {isVideo ? (
          <Video
            source={{ uri: item.imageUrl }}
            style={styles.video}
            shouldPlay={false}
            resizeMode={VideoResizeMode.COVER}
            isLooping
          />
        ) : (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <View style={styles.banner}>
        <Image source={{ uri: "https://i.pinimg.com/originals/97/fd/40/97fd40b04ea88ae05c66332c64de4fa9.png" }} style={styles.bannerImage} />
      </View>
      <View style={styles.userProfileActionsView}>
        <View style={styles.userData}>
          <Image source={{ uri: userData ? userData.profilePictureUrl : undefined }} style={styles.userImage} />
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{userData ? userData.username : 'user'}</Text>
            {userData?.Subscription?.isActive && (
              <MaterialIcons name="verified" size={16} color="#FFC000" style={styles.verifiedIcon} />
            )}
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.text}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.profileData}>
        <Text style={styles.bio}>
          {userData?.bio ? userData.bio : "Clique em editar para adicionar um bio."}
        </Text>
        
        <View style={styles.followerInformation}>
          <Text style={styles.followerText}>{userStats ? userStats.followingCount : 0} seguindo</Text>
          <Text style={styles.followerText}>{userStats ? userStats.followersCount : 0} seguidores</Text>
          <Text style={styles.followerText}>{posts.length} Publicações</Text>
        </View>
        <View style={styles.line} />
      </View>

      <FlatList
        data={posts}
        style={styles.flatList}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.posts}
        numColumns={3}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      
      {posts.length === 0 && (
        <View style={styles.noPostsContainer}>
        <Text style={styles.noPostsText}>Você ainda não fez uma publicação 😐</Text>
      </View>
      )}

      <TabMenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  banner: {
    width: '100%',
    resizeMode: 'cover',
    height: "20%",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  userProfileActionsView: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    height: "8%",
  },
  userData: {
    alignItems: "center",
    top: -65,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#5312C2",
  },
  username: {
    color: "white",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  editButton: {
    width: 100,
    height: 40,
    backgroundColor: "#363636",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  profileData: {
    paddingLeft: 15,
    paddingRight: 15,
    height: "8%",
    marginTop: 10,
  },
  followerInformation: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bio: {
    color: "white",
  },
  followerText: {
    color: "white",
    fontSize: 13,
  },
  posts: {
    paddingBottom: 20,
  },
  messageText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  verifiedIcon: {
    top: 1,
  },
  // Styles for posts
  post: {
    width: '31%',
    margin: 5,
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,

  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  line: {
    height: 1,
    backgroundColor: '#444',
    marginTop: 10,
  },
  flatList: {
    top: -8,

  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noPostsText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.4,
    top: -230
  },
});

export default MyProfile;
