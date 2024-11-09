// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { StackScreenProps } from '@react-navigation/stack';

// import { RootStackParamList } from '.';
// import { HeaderButton } from '../components/HeaderButton';
// import { TabBarIcon } from '../components/TabBarIcon';
// import One from '../screens/one';
// import Two from '../screens/two';
// import TelaInicial from '../screens/telainicial'
// import Login from '../screens/login';
// import RecomendacaoUser from '../screens/recomendacaouser';

// const Tab = createBottomTabNavigator();

// type Props = StackScreenProps<RootStackParamList, 'TabNavigator'>;

// export default function TabLayout({ navigation }: Props) {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: 'black',
//       }}>
//       <Tab.Screen
//         name="One"
//         component={One}
//         options={{
//           title: 'Tab One',
//           tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
//           headerRight: () => <HeaderButton onPress={() => navigation.navigate('Modal')} />,
//         }}
//       />
//       <Tab.Screen
//         name="Two"
//         component={Two}
//         options={{
//           title: 'Tab Two',
//           tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
//         }}
//       />
//        <Tab.Screen
//                      name="Login"
//                      component={Login} //
//                      options={{
//                        title: 'Login',
//                        tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
//                      }}
//                    />
//       <Tab.Screen
//         name="TelaInicial"
//         component={TelaInicial} //
//         options={{
//             title: 'Tela Inicial',
//                 tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
//               }}
//             />
//       <Tab.Screen
//         name="RecomendacaoUser"
//         component={RecomendacaoUser} //
//         options={{
//           title: 'Recomendação',
//           tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
//         }}
//       />
//     </Tab.Navigator>
//   );
// }
