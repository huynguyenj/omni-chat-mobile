import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { ComponentType } from 'react'
import { LucideIcon } from 'lucide-react-native';
import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

type TAB_LIST_ITEMS_TYPES = {
  route: string;
  label: string;
  icon: LucideIcon;
  screen: ComponentType<any>;
};

type TabButtonProps = BottomTabBarButtonProps & { item: TAB_LIST_ITEMS_TYPES };

function TabButton(props: TabButtonProps) {
  const { accessibilityState, item, onPress,  } = props
   const focused = props['aria-selected'];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabButtonOuter}
    >
      <View style={[styles.tabButtonInner, focused && styles.tabButtonInnerFocused]}>
        <item.icon
          size={20}
          color={focused ? '#ffffff' : '#8A96A8'}
          strokeWidth={focused ? 2.5 : 1.5}
        />
        <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


export default function BottomTabNavigator({ routeList }: {routeList: TAB_LIST_ITEMS_TYPES[]}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabBarItem,  
              }}
            >
              {routeList.map((item) => (
                <Tab.Screen
                  key={item.route}
                  name={item.label}
                  component={item.screen}
                  options={{
                    tabBarShowLabel: false,
                    tabBarButton: (props) => <TabButton {...props} item={item} />,
                  }}
                />
              ))}
            </Tab.Navigator>
    </SafeAreaView>
      
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  tabBar: {
    height: 90,
    position: 'absolute',
    bottom: 5,
    marginLeft: 12,                          
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabBarItem: {
    height: 90,                        
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
                                       
  },
  tabButtonInner: {
    width: 110,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  tabButtonInnerFocused: {
    backgroundColor: '#003366',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8A96A8',
    textAlign: 'center',
  },
  tabLabelFocused: {
    color: '#ffffff',
    fontWeight: '700',
  },
});