import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/features/auth/store/auth-store';
import AuthNavigator from './src/navigation/AuthNavigator';
import RoleNavigator from './src/navigation/validate-route/RoleNavigator';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    primary: '##F2F4F7',
  },
};

export default function App() {
    const accessToken = useAuthStore((s) => s.accessToken)
    console.log(accessToken);
    
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={MyTheme}
      >
         { !accessToken ? <AuthNavigator/> : <RoleNavigator/>  }
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

