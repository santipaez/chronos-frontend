import AppContainer from './AppContainer';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

export default function App() {
  return <AppContainer />;
}

AppRegistry.registerComponent('main', () => App);