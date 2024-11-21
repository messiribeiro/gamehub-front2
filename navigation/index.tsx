import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from '../screens/camera';
import Chat from '../screens/chat';
import ChatWindow from '../screens/chatWindow';
import Dashboard from '../screens/dashboard';
import EditPostInfo from '../screens/editPostInfo';
import EditProfile from '../screens/editProfile';
import FindGamer from '../screens/findGamer';
import FullScreen from '../screens/fullScreen';
import Galery from '../screens/gallery';
import GameImageSelect from '../screens/gameImageSelect';
import GamePreview from '../screens/gamePreview';
import GameRegister from '../screens/gameRegister';
import GameSelect from '../screens/gameSelect';
import Home from '../screens/home';
import MyProfile from '../screens/myProfile';
import Payment from '../screens/payment';
import Profile from '../screens/profile';
import Subscribe from '../screens/subscribe';
import Settings from '@/screens/settings/settings';
import Search from '@/screens/search';


import Login from '../screens/login';
import SignupStep1 from '../screens/signupStep1';
import SignupStep2 from '../screens/signupStep2';
import SignupStep3 from '../screens/signupStep3';
import Support from '@/screens/donate/donate';

import AddReward from '@/screens/gameManager/addReward';
import SetDonateAmount from '@/screens/donate/setDonateAmount';
import MyGames from '@/screens/myGames';
import GameAnalytics from '@/screens/gameManager/gameAnalytics';


export type RootStackParamList = {
  TabNavigator: undefined;
  Modal: undefined;
  Login: undefined;
  SignupStep1: undefined;
  SignupStep2: undefined;
  SignupStep3: undefined;
  GameSelect: undefined;
  Profile: { profileUserId: string };
  MyProfile: undefined;
  Home: undefined;
  FindGamer: { gameId: number };
  Chat: undefined;
  ChatWindow: {
    receiverId: number;
    receiverName: string; // Add receiverName here
  };
  Camera: { isProfilePicture: boolean };
  PhotoPreview: { photoUri: string };
  EditPostInfo: { photoUri: string; cameraType: string };
  Galery: { isProfilePicture: boolean };
  FullScreen: { postId: string };
  EditProfile: { profilePictureUri: string | null };
  Subscribe: undefined;
  GameRegister: { imageUri?: string | null };
  GameImageSelect: undefined;
  GamePreview: undefined;
  Dashboard: { from?: string };
  Payment: { type: string };
  MyGames: undefined;
  Support: undefined;
  SetDonateAmount: undefined;
  GameAnalytics: undefined;
  AddReward: undefined;
  Settings: undefined;
  Search: undefined;
};

// Criando o Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#1B1B1E',
  },
};


type RootStackProps = {
  linking: {
    prefixes: string[];
    config: {
      screens: {
        Home: string;
        Subscribe: string;
      };
    };
  };
};

export default function RootStack({ linking }: RootStackProps) {
  return (
    <NavigationContainer independent={true} linking={linking} theme={MyTheme}>
      <Stack.Navigator initialRouteName="Search">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignupStep1" component={SignupStep1} options={{ headerShown: false }} />
        <Stack.Screen name="SignupStep2" component={SignupStep2} options={{ headerShown: false }} />
        <Stack.Screen name="SignupStep3" component={SignupStep3} options={{ headerShown: false }} />
        <Stack.Screen name="GameSelect" component={GameSelect} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="FindGamer" component={FindGamer} options={{ headerShown: false }} />
        <Stack.Screen name="ChatWindow" component={ChatWindow} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="EditPostInfo"
          component={EditPostInfo}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Galery" component={Galery} options={{ headerShown: false }} />
        <Stack.Screen name="FullScreen" component={FullScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Subscribe" component={Subscribe} options={{ headerShown: false }} />
        <Stack.Screen
          name="GameImageSelect"
          component={GameImageSelect}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GameRegister"
          component={GameRegister}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="GamePreview" component={GamePreview} options={{ headerShown: false }} />
        <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
        <Stack.Screen name="Support" component={Support} options={{ headerShown: false }} />
        <Stack.Screen name="MyGames" component={MyGames} options={{ headerShown: false }} />
        <Stack.Screen name="GameAnalytics" component={GameAnalytics} options={{ headerShown: false }} />
        <Stack.Screen name="SetDonateAmount" component={SetDonateAmount} options={{ headerShown: false }} />
        <Stack.Screen name="AddReward" component={AddReward} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={Search} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
