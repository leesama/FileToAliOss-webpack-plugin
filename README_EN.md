# FileToAliOssWebpackPlugin

![GitHub CI](https://github.com/leesama/fileToAliOss-webpack-plugin/actions/workflows/publish.yml/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/leesama/fileToAliOss-webpack-plugin/badge.svg?branch=master)](https://coveralls.io/github/leesama/fileToAliOss-webpack-plugin?branch=master)

[中文](README.md) | [English](README_EN.md)

FileToAliOssWebpackPlugin is a Webpack plugin that allows you to upload the bundled files to Aliyun OSS (Object Storage Service). This is particularly useful during the project build and deployment phase, as it allows you to directly upload static resource files to OSS for easy CDN acceleration and distribution.

## Installation

You can install the plugin using npm:

```bash
npm install file-to-alioss-webpack-plugin --save-dev
```

Or, with yarn:

```bash
yarn add file-to-alioss-webpack-plugin --dev
```

## Usage

In your Webpack configuration file, import the plugin and add it to the `plugins` array. You can pass a configuration object to customize the plugin's behavior. Here is a basic example of a Webpack configuration:

```javascript
const FileToAliOssWebpackPlugin = require("file-to-alioss-webpack-plugin");

const webpackConfig = {
  // ...other configurations
  plugins: [
    new FileToAliOssWebpackPlugin({
      // Configuration options
    }),
    // ...other plugins
  ],
};
```

## Configuration Options

FileToAliOssWebpackPlugin supports the following configuration options:

### auth

- Type: `OSSAuthConfig`
- Default:
  ```javascript
  {
    accessKeyId: "",
    accessKeySecret: "",
    bucket: "",
    region: "",
  }
  ```
- Description: Aliyun OSS authentication configuration object. You need to provide the accessKeyId, accessKeySecret, bucket, and region information of your Aliyun account to connect and upload files to the corresponding OSS bucket.

### retry

- Type: `number`
- Default: `3`
- Description: The number of retries when uploading files. If an error occurs during the upload process, the plugin will attempt to re-upload the file for the specified number of times until reaching the retry limit.

### existCheck

- Type: `boolean`
- Default: `true`
- Description: Whether to check if the file already exists in OSS before uploading. If set to `true`, the plugin will check if the target file already exists in OSS before uploading to avoid duplicate uploads.

### ossBaseDir

- Type: `string`
- Default: `"auto_upload_ci"`
- Description: The OSS directory for uploading files. All uploaded files will be placed under this directory. Make sure this directory already exists in OSS.

### projectName

- Type: `string`
- Default: `""`
- Description: The project name used to concatenate the OSS file path for uploading. If not provided, the plugin will attempt to retrieve it from the `package.json` file.

### prefix

- Type: `string`
- Default: `""`
- Description: Custom OSS directory prefix. If provided, it will override the settings of `ossBaseDir` and `projectName`. For example: `"your-custom-prefix"`.

### exclude

- Type: `RegExp`
- Default: `/.*\.html$/`
- Description: A regular expression used to exclude files that do not need to be uploaded to OSS. Files that match this regular expression will be excluded from the upload list.

### enableLog

- Type: `boolean`
- Default: `false`
- Description: Whether to enable logging output for the plugin. If set to `true`, the plugin will output log messages during the upload process.

### ignoreErrors

- Type: `boolean`
- Default: `false`
- Description: Whether to ignore errors that occur during the upload process. If set to `true`, the plugin will continue to upload other files even if an error occurs while uploading the current file.

### removeMode

- Type: `boolean`
- Default: `true`
- Description: Whether to automatically remove files from the Webpack output directory after successful upload. If set to `true`, the plugin will automatically delete the corresponding file after successful upload.

### useGzip

- Type: `boolean` or `number`
- Default: `true`
- Description: Whether to enable Gzip compression for uploaded files. If set to `true`, the plugin will compress the file with Gzip before uploading. You can also specify a number to set the compression level, for example: `{ useGzip: 5 }`.

### envPrefix

- Type: `string`
- Default: `""`
- Description: Environment variable prefix. The plugin supports using environment variables to configure some options. You can specify the prefix of environment variables using `envPrefix`. For detailed usage, please refer to the "Configuring the Plugin with Environment Variables" section below.

### options

- Type: `any`
- Default: `undefined`
- Description: Additional upload options. You can use this option to specify additional options for uploading files. For detailed usage, please refer to the Aliyun OSS documentation.

## Configuring the Plugin with Environment Variables

FileToAliOssWebpackPlugin allows you to configure some options using environment variables. You can override the default plugin configuration by setting environment variables when running the Webpack command.

The following options can be configured using environment variables:

1. auth.accessKeyId
2. auth.accessKeySecret
3. auth.bucket
4. auth.region
5. enableLog
6. ignoreErrors
7. removeMode
8. ossBaseDir
9. prefix

Assuming your environment variable prefix is `MY_APP_`, you can configure the plugin using the corresponding environment variables. For example:

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

When configuring Webpack, you can use the above environment variables to configure the FileToAliOssWebpackPlugin plugin:

```javascript
const webpackConfig = {
  // ...other configurations
  plugins: [
    new FileToAliOssWebpackPlugin({
      envPrefix: "MY_APP_",
      // Other configurations
    }),
    // ...other plugins
  ],
};
```

By setting `envPrefix` to `"MY_APP_"`, the plugin will override the default plugin configuration based on the corresponding values in the environment variables.

## Important Notes

Please ensure that you have created the corresponding OSS bucket and directories before uploading files. Also, make sure that the provided Aliyun account information and configuration options are correct.

## License

MIT License. See the [LICENSE](https://github.com/leesama/fileToAliOss-webpack-plugin/blob/main/LICENSE) file for more details.

## Contributing

Contributions of any kind are welcome! If you find a bug or

 have any suggestions or feedback, please submit an [Issue](https://github.com/leesama/fileToAliOss-webpack-plugin/issues) or create a [Pull Request](https://github.com/leesama/fileToAliOss-webpack-plugin/pulls).

## Frequently Asked Questions

- **Q: The uploaded files are not processed correctly?**
  A: Please ensure that the `output.publicPath` in your Webpack configuration is set to the URL of the `prefix` corresponding to the OSS path. For example: `output.publicPath: '//test.com/auto_upload_ci/your-project-name/'`.

- **Q: How to set the Gzip compression level?**
  A: You can set the Gzip compression level using the `useGzip` option, for example: `useGzip: 5`. If you don't set `useGzip` or set it to `true`, the default compression level will be used.

- **Q: How to use this plugin to upload images?**
  A: FileToAliOssWebpackPlugin will process all files generated by Webpack, including image files. You can exclude files that don't need to be uploaded using the `exclude` option, for example: `exclude: /.*\.(html|png|jpg|jpeg|gif)$/`.