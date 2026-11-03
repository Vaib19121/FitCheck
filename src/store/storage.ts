import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// TODO: pass an `encryptionKey` before persisting anything sensitive.
export const storage = createMMKV({ id: 'app-storage' });

/** MMKV adapter for zustand's `persist`. Synchronous, so stores hydrate before first render. */
export const zustandStorage: StateStorage = {
  getItem: name => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: name => {
    storage.remove(name);
  },
};
