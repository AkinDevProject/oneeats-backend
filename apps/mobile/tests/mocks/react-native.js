/**
 * Mock complet de React Native pour les tests Jest
 * Ce fichier remplace react-native pour éviter le chargement des modules natifs
 */
const React = require('react');

const mockComponent = (name) => {
  const Component = ({ children, ...props }) => {
    return React.createElement(name, props, children);
  };
  Component.displayName = name;
  return Component;
};

// Core components
const View = mockComponent('View');
const Text = mockComponent('Text');
const TextInput = mockComponent('TextInput');
const TouchableOpacity = mockComponent('TouchableOpacity');
const TouchableHighlight = mockComponent('TouchableHighlight');
const TouchableWithoutFeedback = mockComponent('TouchableWithoutFeedback');
const Pressable = mockComponent('Pressable');
const ScrollView = mockComponent('ScrollView');
const FlatList = mockComponent('FlatList');
const SectionList = mockComponent('SectionList');
const Image = mockComponent('Image');
const ImageBackground = mockComponent('ImageBackground');
const ActivityIndicator = mockComponent('ActivityIndicator');
const Modal = mockComponent('Modal');
const Switch = mockComponent('Switch');
const RefreshControl = mockComponent('RefreshControl');
const SafeAreaView = mockComponent('SafeAreaView');
const KeyboardAvoidingView = mockComponent('KeyboardAvoidingView');
const StatusBar = mockComponent('StatusBar');

// Animated API
const Animated = {
  View: mockComponent('Animated.View'),
  Text: mockComponent('Animated.Text'),
  Image: mockComponent('Animated.Image'),
  ScrollView: mockComponent('Animated.ScrollView'),
  FlatList: mockComponent('Animated.FlatList'),
  createAnimatedComponent: (comp) => comp,
  timing: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
  spring: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
  decay: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
  sequence: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
  parallel: jest.fn(() => ({ start: jest.fn((cb) => cb && cb({ finished: true })) })),
  loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  event: jest.fn(),
  add: jest.fn(),
  subtract: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  modulo: jest.fn(),
  diffClamp: jest.fn(),
  delay: jest.fn(),
  Value: jest.fn(function(val) {
    this._value = val;
    this.setValue = jest.fn((v) => { this._value = v; });
    this.setOffset = jest.fn();
    this.flattenOffset = jest.fn();
    this.extractOffset = jest.fn();
    this.addListener = jest.fn(() => 'listener-id');
    this.removeListener = jest.fn();
    this.removeAllListeners = jest.fn();
    this.stopAnimation = jest.fn((cb) => cb && cb(this._value));
    this.resetAnimation = jest.fn((cb) => cb && cb(this._value));
    this.interpolate = jest.fn(() => new Animated.Value(0));
    this.__getValue = jest.fn(() => this._value);
  }),
  ValueXY: jest.fn(function(val) {
    val = val || { x: 0, y: 0 };
    this.x = new Animated.Value(val.x);
    this.y = new Animated.Value(val.y);
    this.setValue = jest.fn();
    this.setOffset = jest.fn();
    this.flattenOffset = jest.fn();
    this.extractOffset = jest.fn();
    this.getLayout = jest.fn(() => ({ left: this.x, top: this.y }));
    this.getTranslateTransform = jest.fn(() => [{ translateX: this.x }, { translateY: this.y }]);
    this.stopAnimation = jest.fn((cb) => cb && cb({ x: 0, y: 0 }));
    this.resetAnimation = jest.fn((cb) => cb && cb({ x: 0, y: 0 }));
    this.addListener = jest.fn(() => 'listener-id');
    this.removeListener = jest.fn();
  })
};

module.exports = {
  // Platform
  Platform: {
    OS: 'ios',
    Version: 14,
    select: (obj) => obj.ios || obj.default,
    isPad: false,
    isTV: false,
    isTesting: true
  },

  // Alert
  Alert: {
    alert: jest.fn()
  },

  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
    set: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn()
  },

  // StyleSheet
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...s }), {});
      }
      return style;
    },
    compose: (style1, style2) => [style1, style2],
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    hairlineWidth: 1
  },

  // Core components
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
  FlatList,
  SectionList,
  Image,
  ImageBackground,
  ActivityIndicator,
  Modal,
  Switch,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,

  // Animated
  Animated,

  // Easing
  Easing: {
    linear: jest.fn((t) => t),
    ease: jest.fn((t) => t),
    quad: jest.fn((t) => t * t),
    cubic: jest.fn((t) => t * t * t),
    poly: jest.fn(() => jest.fn((t) => t)),
    sin: jest.fn((t) => Math.sin(t)),
    circle: jest.fn((t) => t),
    exp: jest.fn((t) => Math.exp(t)),
    elastic: jest.fn(() => jest.fn((t) => t)),
    back: jest.fn(() => jest.fn((t) => t)),
    bounce: jest.fn((t) => t),
    bezier: jest.fn(() => jest.fn((t) => t)),
    in: jest.fn((fn) => fn),
    out: jest.fn((fn) => fn),
    inOut: jest.fn((fn) => fn)
  },

  // Keyboard
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    isVisible: jest.fn(() => false),
    metrics: jest.fn(() => null),
    scheduleLayoutAnimation: jest.fn()
  },

  // Linking
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    openSettings: jest.fn(() => Promise.resolve())
  },

  // AppState
  AppState: {
    currentState: 'active',
    isAvailable: true,
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn()
  },

  // NativeModules
  NativeModules: {},

  // NativeEventEmitter
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn()
  })),

  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => Math.round(size))
  },

  // I18nManager
  I18nManager: {
    isRTL: false,
    doLeftAndRightSwapInRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    swapLeftAndRightInRTL: jest.fn()
  },

  // Hooks
  useColorScheme: jest.fn(() => 'light'),
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),

  // VirtualizedList helpers
  VirtualizedList: mockComponent('VirtualizedList'),

  // Additional components
  Button: mockComponent('Button'),
  Slider: mockComponent('Slider'),
  ProgressViewIOS: mockComponent('ProgressViewIOS'),
  DatePickerIOS: mockComponent('DatePickerIOS'),
  DrawerLayoutAndroid: mockComponent('DrawerLayoutAndroid'),
  ProgressBarAndroid: mockComponent('ProgressBarAndroid'),
  SegmentedControlIOS: mockComponent('SegmentedControlIOS'),
  TabBarIOS: mockComponent('TabBarIOS'),
  ToolbarAndroid: mockComponent('ToolbarAndroid'),
  ViewPagerAndroid: mockComponent('ViewPagerAndroid'),
  InputAccessoryView: mockComponent('InputAccessoryView'),

  // Additional utilities
  findNodeHandle: jest.fn(() => 1),
  processColor: jest.fn((color) => color),
  requireNativeComponent: jest.fn(() => mockComponent('NativeComponent')),
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({})),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    setLayoutAnimationEnabledExperimental: jest.fn()
  },
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Types: { spring: 'spring', linear: 'linear', easeInEaseOut: 'easeInEaseOut', easeIn: 'easeIn', easeOut: 'easeOut' },
    Properties: { opacity: 'opacity', scaleX: 'scaleX', scaleY: 'scaleY', scaleXY: 'scaleXY' },
    Presets: { easeInEaseOut: {}, linear: {}, spring: {} }
  },
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => {
      if (callback) callback();
      return { cancel: jest.fn(), done: Promise.resolve() };
    }),
    createInteractionHandle: jest.fn(),
    clearInteractionHandle: jest.fn()
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {}
    }))
  },
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' }))
  },
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn()
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn()
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    removeChangeListener: jest.fn()
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn()
  },
  DeviceEventEmitter: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
    removeAllListeners: jest.fn()
  },
  LogBox: {
    ignoreLogs: jest.fn(),
    ignoreAllLogs: jest.fn(),
    install: jest.fn(),
    uninstall: jest.fn()
  }
};
