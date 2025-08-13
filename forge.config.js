module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'src/assets/browser' 
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'UiboBrowser',
        setupIcon: 'src/assets/browser.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'], 
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};