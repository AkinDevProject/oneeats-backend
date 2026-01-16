/**
 * Configuration globale des tests Jest pour l'application mobile OneEats
 * Compatible avec Expo 54+ sans jest-expo preset
 *
 * Note: react-native est mocke via moduleNameMapper dans jest.config.js
 */

// Mock des modules Expo
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' }
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    navigate: jest.fn()
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    navigate: jest.fn()
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useSegments: () => [],
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
  Link: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock('expo-auth-session', () => ({
  AuthRequest: jest.fn().mockImplementation(() => ({
    promptAsync: jest.fn()
  })),
  exchangeCodeAsync: jest.fn(),
  refreshAsync: jest.fn(),
  revokeAsync: jest.fn(),
  makeRedirectUri: jest.fn(() => 'oneeats://auth/callback'),
  ResponseType: { Code: 'code' },
  TokenTypeHint: { AccessToken: 'access_token', RefreshToken: 'refresh_token' }
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn()
}));

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-expo-token' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 }
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {}
    }
  }
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null
}));

// Mock AsyncStorage avec fonctions exportees directement
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([]))
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  return {
    default: {
      View: View,
      Text: Text,
      call: () => {}
    },
    View: View,
    Text: Text,
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    FadeIn: { duration: () => ({}) },
    FadeInDown: { delay: () => ({ duration: () => ({ springify: () => ({}) }) }) },
    SlideInRight: {},
    Layout: { springify: () => ({}) },
    Easing: {
      linear: (v: any) => v,
      ease: (v: any) => v
    }
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: (component: any) => component,
    Directions: {}
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, style }: any) =>
      React.createElement(View, { style }, children),
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
  };
});

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, TextInput: RNTextInput, ActivityIndicator: RNActivityIndicator } = require('react-native');

  const Card = ({ children, style }: any) => React.createElement(View, { style }, children);
  Card.Content = ({ children }: any) => React.createElement(View, null, children);
  Card.Title = ({ title }: any) => React.createElement(Text, null, title);
  Card.Actions = ({ children }: any) => React.createElement(View, null, children);

  const Avatar = {
    Text: ({ label, size, style }: any) => React.createElement(Text, { style }, label),
    Icon: ({ icon }: any) => React.createElement(Text, null, icon),
    Image: ({ source }: any) => React.createElement(View, null)
  };

  return {
    Card,
    Avatar,
    Button: ({ children, onPress, disabled, loading, mode, icon }: any) =>
      React.createElement(TouchableOpacity, { onPress, disabled: disabled || loading },
        React.createElement(Text, null, children)),
    TextInput: ({ label, value, onChangeText, ...props }: any) =>
      React.createElement(View, null, [
        React.createElement(Text, { key: 'label' }, label),
        React.createElement(RNTextInput, { key: 'input', value, onChangeText, ...props })
      ]),
    Surface: ({ children, style }: any) => React.createElement(View, { style }, children),
    Chip: ({ children, onPress, selected }: any) =>
      React.createElement(TouchableOpacity, { onPress }, React.createElement(Text, null, children)),
    IconButton: ({ icon, onPress, size, iconColor }: any) =>
      React.createElement(TouchableOpacity, { onPress, testID: `icon-${icon}` },
        React.createElement(Text, null, icon)),
    TouchableRipple: ({ children, onPress, disabled, style }: any) =>
      React.createElement(TouchableOpacity, { onPress, disabled, style }, children),
    ActivityIndicator: RNActivityIndicator,
    Provider: ({ children }: any) => children,
    MD3LightTheme: {},
    MD3DarkTheme: {}
  };
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createIcon = (name: string) => (props: any) =>
    React.createElement(View, { testID: `icon-${name}`, ...props });

  return new Proxy({}, {
    get: (target, prop) => createIcon(String(prop))
  });
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const createIconSet = (name: string) => (props: any) =>
    React.createElement(Text, { testID: `icon-${props.name}` }, props.name);

  return {
    MaterialIcons: createIconSet('MaterialIcons'),
    MaterialCommunityIcons: createIconSet('MaterialCommunityIcons'),
    Ionicons: createIconSet('Ionicons'),
    FontAwesome: createIconSet('FontAwesome'),
    Feather: createIconSet('Feather')
  };
});

// Silence les warnings de console pendant les tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Animated') ||
       message.includes('NativeEventEmitter') ||
       message.includes('`new NativeEventEmitter()`') ||
       message.includes('componentWillReceiveProps') ||
       message.includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Warning:') ||
       message.includes('act(...)') ||
       message.includes('React does not recognize'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Reset tous les mocks apres chaque test
afterEach(() => {
  jest.clearAllMocks();
});
