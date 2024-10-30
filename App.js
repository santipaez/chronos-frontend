import AppContainer from './AppContainer';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

NavigationBar.setPositionAsync('absolute')
NavigationBar.setButtonStyleAsync("dark");

export default function App() {
  return <AppContainer />;
}

AppRegistry.registerComponent('main', () => App);