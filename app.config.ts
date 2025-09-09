import { ExpoConfig } from '@expo/config'

const config: ExpoConfig = {
  name: 'Clube de Vantagens Rahdar',
  slug: 'rahdar',
  version: '1.0.0', // versão exibida ao usuário
  runtimeVersion: '1.0.0', // 🚨 FIXO (necessário no bare workflow)
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
  },
  android: {
    package: 'com.iaki.rahdar',
    versionCode: 1,
  },
  ios: {
    bundleIdentifier: 'com.iaki.rahdar',
    buildNumber: '1',
  },
}

export default config
