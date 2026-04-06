import 'react-native-gesture-handler';
import { View, Text, StyleSheet } from 'react-native'
import React, { ComponentType } from 'react'
import { LucideIcon } from 'lucide-react-native';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { TAB_LIST_ITEMS_TYPES } from '../../types/route-type';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerScrollContent}
    >
      {/* Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Manager</Text>
      </View>
      {/* Nav items */}
        <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator({ routeList }: {routeList: TAB_LIST_ITEMS_TYPES[]}) {
  return (
    <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
             screenOptions={({ route }) => {
            const tab = routeList.find((t) => t.route === route.name);
            return {
              headerShown: true,
              headerStyle: styles.header,
              headerTitleStyle: styles.headerTitle,
              drawerStyle: styles.drawer,
              drawerActiveTintColor: '#3B6399',
              drawerInactiveTintColor: '#4a5568',
              drawerActiveBackgroundColor: '#eef2f7',
              drawerInactiveBackgroundColor: 'transparent',
              drawerItemStyle: styles.drawerItem,
              drawerLabelStyle: [styles.drawerLabel],
              drawerIcon: ({ color, focused }) =>
                tab ? (
                  <tab.icon
                    size={20}
                    color={color}
                    strokeWidth={focused ? 3.5 : 3}
                  />
                ) : null,
            };
          }}
          >
            {routeList.map((manager, index) => (
              <Drawer.Screen name={manager.route} component={manager.screen}/>
            ))}
          </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#ffffff',
    width: 280,
  },
  drawerScrollContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2332',
    letterSpacing: 0.3,
    marginVertical: 20
  },
  drawerItem: {
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 1,
    paddingVertical: 2,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,       
  },
  header: {
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2332',
  },
});