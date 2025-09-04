// Supprimer les warnings React Native Web en développement
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      (args[0].includes('"shadow*" style props are deprecated') ||
       args[0].includes('props.pointerEvents is deprecated') ||
       args[0].includes('textShadow*') ||
       args[0].includes('useNativeDriver') ||
       args[0].includes('Listening to push token changes'))
    ) {
      return;
    }
    originalWarn(...args);
  };
}