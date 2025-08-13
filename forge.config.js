// forge.config.js (修正版)
module.exports = {
  packagerConfig: {
    asar: true,
    // 你的应用图标路径 (正确)
    icon: 'src/assets/browser' 
  },
  rebuildConfig: {},
  makers: [
    {
      // 制作 Windows 平台的安装包 (.exe) - 这部分保持不变
      name: '@electron-forge/maker-squirrel',
      config: {
        // 你的应用名称 (正确)
        name: 'UiboBrowser',
        // 安装程序的图标路径 (正确)
        setupIcon: 'src/assets/browser.ico'
      },
    },
    {
      // 制作 Zip 压缩包 (便携版)
      name: '@electron-forge/maker-zip',
      // 关键改动：将 'darwin' 修改为 'win32'
      platforms: ['win32'], 
    },
    {
      // 以下是为其他操作系统准备的，可以保留
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};