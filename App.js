import AppContainer from './AppContainer';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

// enables edge-to-edge mode
NavigationBar.setPositionAsync('absolute')
// changes the color of the button icons "dark||light"
NavigationBar.setButtonStyleAsync("dark");

export default function App() {
  return <AppContainer />;
}

AppRegistry.registerComponent('main', () => App);