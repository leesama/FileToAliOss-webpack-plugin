# FileToAliOssWebpackPlugin

![GitHub CI](https://github.com/leesama/fileToAliOss-webpack-plugin/actions/workflows/publish.yml/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/leesama/fileToAliOss-webpack-plugin/badge.svg?branch=master)](https://coveralls.io/github/leesama/fileToAliOss-webpack-plugin?branch=master)

[中文](README.md) | [English](README_EN.md)

FileToAliOssWebpackPlugin 是一个用于 Webpack 的插件，它可以将打包生成的文件上传至阿里云 OSS（Object Storage Service）中。这在构建和部署项目时特别有用，可以将静态资源文件直接上传到 OSS，方便进行 CDN 加速和分发。

## 安装

使用 npm 进行安装：

```bash
npm install file-to-alioss-webpack-plugin --save-dev
```

或者使用 yarn：

```bash
yarn add file-to-alioss-webpack-plugin --dev
```

## 使用方法

在 Webpack 配置文件中，引入该插件并将其添加到 `plugins` 数组中。可以传递一个配置对象来自定义插件的行为。以下是一个基本的 Webpack 配置示例：

```javascript
const FileToAliOssWebpackPlugin = require("file-to-alioss-webpack-plugin");

const webpackConfig = {
  // ...其他配置
  plugins: [
    new FileToAliOssWebpackPlugin({
      // 配置选项
    }),
    // ...其他插件
  ],
};
```

## 配置选项

FileToAliOssWebpackPlugin 支持以下配置选项：

### auth

- 类型: `OSSAuthConfig`
- 默认值:
  ```javascript
  {
    accessKeyId: "",
    accessKeySecret: "",
    bucket: "",
    region: "",
  }
  ```
- 描述: 阿里云 OSS 认证配置对象。需要提供阿里云账号的 accessKeyId、accessKeySecret、bucket 和 region 信息，用于连接并上传文件到对应的 OSS 存储空间。

### retry

- 类型: `number`
- 默认值: `3`
- 描述: 上传文件时的重试次数。在上传过程中如果发生错误，插件将会尝试重新上传文件的次数，直到达到重试次数上限。

### existCheck

- 类型: `boolean`
- 默认值: `true`
- 描述: 上传文件前是否检查文件是否已经存在于 OSS 中。如果设置为 `true`，插件将会在上传文件之前检查目标文件是否已经存在于 OSS 中，避免重复上传相同文件。

### ossBaseDir

- 类型: `string`
- 默认值: `"auto_upload_ci"`
- 描述: 上传文件的 OSS 目录。所有上传的文件都将放置在该目录下。请确保该目录在 OSS 中已经存在。

### projectName

- 类型: `string`
- 默认值: `""`
- 描述: 项目名称，用于拼接上传文件的 OSS 路径。如果不提供项目名称，将会尝试从 package.json 文件中获取。

### prefix

- 类型: `string`
- 默认值: `""`
- 描述: 自定义 OSS 目录前缀，如果提供了该值，则会覆盖 `ossBaseDir` 和 `projectName` 的设置。例如：`"your-custom-prefix"`。

### exclude

- 类型: `RegExp`
- 默认值: `/.*\.html$/`
- 描述: 一个正则表达式，用于排除不需要上传到 OSS 的文件。符合该正则表达式的文件将被排除在上传列表之外。

### enableLog

- 类型: `boolean`
- 默认值: `false`
- 描述: 是否启用插件的日志输出。如果设置为 `true`，插件将在上传过程中输出日志信息。

### ignoreErrors

- 类型: `boolean`
- 默认值: `false`
- 描述: 是否忽略上传过程中的错误。如果设置为 `true`，插件将继续上传其他文件，即使当前文件上传出现错误。

### removeMode

- 类型: `boolean`
- 默认值: `true`
- 描述: 是否在上传成功后删除 Webpack 输出目录中的文件。如果设置为 `true`，插件将在上传成功后自动删除对应的文件。

### useGzip

- 类型: `boolean` 或 `number`
- 默认值: `true`
- 描述: 是否启用 Gzip 压缩上传文件。如果设置为 `true`，插件将会对文件进行 Gzip 压缩后再上传。你还可以指定一个数字来设置压缩级别，例如：`{ useGzip: 5 }`。

### envPrefix

- 类型: `string`
- 默认值: `""`
- 描述: 环境变量前缀。插件支持使用环境变量来配置部分选项，通过设置 `envPrefix` 来指定环境变量的前缀。详细用法请参考下面的 "使用环境变量配置插件" 章节。

### options

- 类型: `any`
- 默认值: `undefined`
- 描述: 额外的上传选项。可以通过该配置项来指定上传文件时的一些额外选项，详细用法请参考阿里云 OSS 的文档。

## 使用环境变量配置插件

FileToAliOssWebpackPlugin 允许使用环境变量来配置插件的部分选项。你可以在运行 Webpack 命令时通过设置环境变量来覆盖插件的默认配置。

以下是可以通过环境变量来配置的选项：

1. auth.accessKeyId
2. auth.accessKeySecret
3. auth.bucket
4. auth.region
5. enableLog
6. ignoreErrors
7. removeMode
8. ossBaseDir
9. prefix

假设你的环境变量前缀为 `MY_APP_`，你可以通过设置相应的环境变量来配置插件。例如：

```bash
MY_APP_FILE_TO_ALIOSS_PLUGIN_ACCESS_KEY_ID=your_access_key_id
MY_APP_FILE_TO_ALIOSS_PLUGIN_ACCESS_KEY_SECRET=your_access_key_secret
MY_APP_FILE_TO_ALIOSS_PLUGIN_BUCKET=your_bucket
MY_APP_FILE_TO_ALIOSS_PLUGIN_REGION=your_region
MY_APP_FILE_TO_ALIOSS_PLUGIN_ENABLE_LOG=true
MY_APP_FILE_TO_ALIOSS_PLUGIN_IGNORE_ERRORS=true
MY_APP_FILE_TO_ALIOSS_PLUGIN_REMOVE_MODE=true
MY_APP_FILE_TO_ALIOSS_PLUGIN_OSS_BASE_DIR=your_oss_base_dir


MY_APP_FILE_TO_ALIOSS_PLUGIN_PREFIX=your_prefix
```

在配置 Webpack 时，可以使用上述环境变量来配置 FileToAliOssWebpackPlugin 插件：

```javascript
const webpackConfig = {
  // ...其他配置
  plugins: [
    new FileToAliOssWebpackPlugin({
      envPrefix: "MY_APP_",
      // 其他配置
    }),
    // ...其他插件
  ],
};
```

通过将 `envPrefix` 设置为 `"MY_APP_"`，插件将根据环境变量中的对应值来覆盖默认的插件配置。

## 注意事项

请确保在上传文件之前，先创建好对应的 OSS 存储空间和目录。此外，确保提供的阿里云账号信息和配置选项正确无误。

## 授权许可

MIT License. 详细信息请查看 [LICENSE](https://github.com/leesama/fileToAliOss-webpack-plugin/blob/main/LICENSE) 文件。

## 贡献

欢迎各种形式的贡献！如果你发现了 Bug，或者有任何建议、意见，欢迎提交 [Issue](https://github.com/leesama/fileToAliOss-webpack-plugin/issues) 或创建 [Pull Request](https://github.com/leesama/fileToAliOss-webpack-plugin/pulls)。

## 常见问题

- **问题 1：上传的文件没有被正确处理？**
  答：请确保 Webpack 配置中的 `output.publicPath` 设置为 `prefix` 对应的 OSS 路径访问 URL。例如：`output.publicPath: '//test.com/auto_upload_ci/your-project-name/'`。

- **问题 2：如何设置 Gzip 压缩级别？**
  答：可以通过 `useGzip` 选项来设置 Gzip 压缩级别，例如：`useGzip: 5`。如果不设置 `useGzip` 或者设置为 `true`，将使用默认压缩级别。

- **问题 3：如何使用该插件进行图片上传？**
  答：FileToAliOssWebpackPlugin 默认会处理 Webpack 打包生成的所有文件，包括图片文件。你可以通过配置 `exclude` 选项来排除不需要上传的文件，例如：`exclude: /.*\.(html|png|jpg|jpeg|gif)$/`。
