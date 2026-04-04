import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/features/auth/store/auth-store';
import AuthNavigator from './src/navigations/AuthNavigator';
import RoleNavigator from './src/navigations/RoleNavigator';


export default function App() {
    const accessToken = useAuthStore((s) => s.accessToken)
  return (
    <SafeAreaProvider>
      <NavigationContainer>
         { !accessToken ? <AuthNavigator/> : <RoleNavigator/>  }
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

