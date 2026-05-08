/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.reyogo.app',
  productName: process.env.PRODUCT_NAME || 'ReYoGo',
  npmRebuild: false,
  directories: { output: 'release' },
  ...(process.env.RELEASE_VERSION && {
    extraMetadata: {
      version: process.env.RELEASE_VERSION.replace(/^v/, ''),
      name: process.env.PRODUCT_NAME || 'ReYoGo',
    },
  }),
  files: ['out/**/*', 'package.json'],
  asarUnpack: ['out/main/db/migrations/**'],
  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'zip', arch: ['x64'] },
    ],
    icon: 'build/icon.png',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  mac: {
    target: ['dmg', 'zip'],
    icon: 'build/icon.icns',
    category: 'public.app-category.business',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },
  ...(process.env.UPDATE_FEED_URL && {
    publish: {
      provider: 'generic',
      url: process.env.UPDATE_FEED_URL,
    },
  }),
};
