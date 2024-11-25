import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import TabMenu from "../components/TabMenu";
import { Video, ResizeMode as VideoResizeMode } from "expo-av";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";

import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../services/api";

import { RootStackParamList } from "../navigation";

interface gameData {
  id: number;
  name: string;
  gameimageUrl?: string;
  description: string | null;
  isStatic: boolean;
  followersCount: number;
}

interface FollowStats {
  followersCount: number;
}

interface Post {
  id: number;
  content: string;
  imageUrl: string;
  authorId: number;
  createdAt: string;
}

type Props = StackScreenProps<RootStackParamList, "GameProfile">;

const Profile: React.FC<Props> = ({ navigation, route }) => {
  const { gameId } = route.params;
  const [gameData, setgameData] = useState<gameData | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [animation] = useState(new Animated.Value(1));
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const numColumns = 3; // Definindo o número de colunas

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    })();
  }, []);

  const fetchData = async () => {
    // setLoading(true);
    try {
      const response = await api.get(`api/games/${gameId}/profile`);
      setgameData(response.data);

      const followStatsResponse = await api.get(
        `/api/friendships/stats/${gameId}`
      );
      setFollowStats(followStatsResponse.data);

      const isFollowingResponse = await api.get(
        `/api/friendships/is-following/${userId}/${gameId}`
      );
      setIsFollowing(isFollowingResponse.data.isFollowing);

      const postsResponse = await api.get(`api/post/game/${gameId}`);
      setPosts(postsResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); // End refreshing
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [gameId, userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFollowUser = async () => {
    try {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const followerId = Number(userId);
      await api.post("api/friendships/follow/game", {
        userId: followerId,
        gameId: Number(gameId),
      });

      setIsFollowing(true);
      setFollowStats((prevStats) => ({
        ...prevStats,
        followersCount: (prevStats ? prevStats.followersCount : 0) + 1,
      }));
    } catch (error) {
      console.error("Erro ao seguir o usuário:", error);
    }
  };

  const profileImageUrl =
    gameData?.gameimageUrl === "https://example.com/profile-picture.jpg"
      ? "https://media.istockphoto.com/id/1185655985/vector/gamer-portrait-video-games-background-glitch-style-player-vector-illustration-online-user.jpg?s=612x612&w=0&k=20&c=uoy0NDqomF2RzJdrNFQM25WwVahjRggjDHYhQoNnx3M="
      : gameData?.gameimageUrl;

  const renderPost = ({ item }: { item: Post }) => {
    const isVideo = item.imageUrl.endsWith(".mp4");

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#121212" />

        <ActivityIndicator size="large" color="#5312C2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <View style={styles.banner}>
        <Image
          source={{
            uri: "https://i.pinimg.com/originals/97/fd/40/97fd40b04ea88ae05c66332c64de4fa9.png",
          }}
          style={styles.bannerImage}
        />
      </View>
      <View style={styles.userProfileActionsView}>
        <View style={styles.gameData}>
          <Image source={{ uri: profileImageUrl }} style={styles.userImage} />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              @{gameData ? gameData.name : "user"}
            </Text>
            {gameData?.isStatic && (
              <MaterialIcons
                name="verified"
                size={16}
                color="#FFC000"
                style={styles.verifiedIcon}
              />
            )}
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ transform: [{ scale: animation }] }}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && { backgroundColor: "#363636" },
              ]}
              onPress={handleFollowUser}
              disabled={isFollowing}
            >
              <Text style={styles.text}>
                {isFollowing ? "Seguindo" : "Seguir"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {gameData?.isStatic && (
            <View style={styles.messageButton}>
              <TouchableOpacity>
                <Feather name="dollar-sign" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View style={styles.profileData}>
        <Text style={styles.description}>
          {gameData?.description ? gameData.description : "game description"}
        </Text>
        <View style={styles.followerInformation}>
          <Text style={styles.followerText}>
            {gameData?.followersCount || 0} Jogadores
          </Text>
          <Text style={[styles.followerText, styles.publicationsText]}>
            {posts.length} Publicações
          </Text>
        </View>
      </View>
      <View style={styles.line} />
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.posts}
          numColumns={numColumns}
          key={`grid-${numColumns}`}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>
            @{gameData?.name} não tem nenhuma publicação
          </Text>
        </View>
      )}
      <TabMenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  banner: {
    width: "100%",
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
  gameData: {
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
  name: {
    color: "white",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  followButton: {
    width: 100,
    height: 40,
    backgroundColor: "#5312C2",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    width: 40,
    height: 40,
    backgroundColor: "#5312C2",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
  profileData: {
    padding: 10,
  },
  description: {
    color: "white",
    marginVertical: 5,
  },
  followerInformation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  followerText: {
    color: "white",
  },
  publicationsText: {
    marginRight: 190, // Ajuste adicional, se necessário, para espaçar "Publicações" de "Jogadores"
  },
  line: {
    height: 1,
    backgroundColor: "#444",
    marginTop: 10,
  },
  post: {
    width: "31%", // Ajusta a largura do post para 1/3 da tela
    margin: 5, // Mantém uma margem ao redor do post
    aspectRatio: 1, // Mantém a proporção de aspecto quadrado
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  posts: {
    paddingBottom: 20,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 5,
  },
  verifiedIcon: {
    top: 1,
  },

  noPostsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noPostsText: {
    color: "white",
    fontSize: 14,
    opacity: 0.4,
    top: -100,
  },
});

export default Profile;
