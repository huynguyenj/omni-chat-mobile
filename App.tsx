import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/features/auth/store/auth-store';
import AuthNavigator from './src/navigation/AuthNavigator';
import RoleNavigator from './src/navigation/validate-route/RoleNavigator';


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

