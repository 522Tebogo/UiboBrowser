// forge.config.js
module.exports = {
  packagerConfig: {
    // 告诉 packager 你的应用源代码在 src 文件夹中
    // 同时，它会忽略一些不必要的文件，比如 .git, node_modules 等
    // 你的主入口文件路径 (main) 已经在 package.json 中定义了，这里会自动读取
    
    // 将应用的asar包压缩，保护源码
    asar: true,
    // 指定应用图标的路径（打包时会自动根据平台添加.ico或.icns后缀）
    icon: 'src/assets/browser' 
  },
  rebuildConfig: {},
  makers: [
    {
      // 制作 Windows 平台的安装包 (.exe)
      name: '@electron-forge/maker-squirrel',
      config: {
        // 你最终的应用名称
        name: 'UiboBrowser',
        // 安装程序的图标
        setupIcon: 'src/assets/browser.ico'
      },
    },
    {
      // 制作 Zip 压缩包
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'], // 可选，为 macOS 准备
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