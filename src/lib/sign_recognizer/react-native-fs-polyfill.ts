/**
 * Polyfill for react-native-fs in web environment
 */

// Default export
export default {
  DocumentDirectoryPath: "/document",
  readFile: async (path: string) => {
    console.warn("[react-native-fs polyfill] readFile called:", path);
    return "";
  },
  exists: async () => false,
  mkdir: async () => {},
  writeFile: async () => {},
};
