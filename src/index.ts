import pathUtils from "path";
import chalkUtils from "chalk";
import lodash from "lodash";
import AliOSSClient from "ali-oss";
import { Buffer } from "buffer";
import zlib from "zlib";

export type OSSAuthConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
};

export type OSSPluginConfig = {
  auth: OSSAuthConfig;
  retry: number;
  existCheck: boolean;
  ossBaseDir: string;
  projectName: string;
  prefix: string;
  exclude: RegExp;
  enableLog: boolean;
  ignoreErrors: boolean;
  removeMode: boolean;
  useGzip: boolean;
  envPrefix: string;
  options: any;
};

const DEFAULT_CONFIG: OSSPluginConfig = {
  auth: {
    accessKeyId: "",
    accessKeySecret: "",
    bucket: "",
    region: "",
  },
  retry: 3,
  existCheck: true,
  ossBaseDir: "auto_upload_ci",
  projectName: "",
  prefix: "",
  exclude: /.*\.html$/,
  enableLog: false,
  ignoreErrors: false,
  removeMode: true,
  useGzip: true,
  envPrefix: "",
  options: undefined,
};

const red = chalkUtils.red;
const green = chalkUtils.bold.green;
function isTruthy(val: string) {
  return val === "true";
}

function getTimeStr(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}

function getFileContentBuffer(file: any, useGzip: boolean | number) {
  const gzip = typeof useGzip === "number" || useGzip === true;
  const options = typeof useGzip === "number" ? { level: useGzip } : {};
  if (!gzip) {
    return Promise.resolve(Buffer.from(file.content));
  }
  return new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(Buffer.from(file.content), options, (err, gzipBuffer) => {
      if (err) reject(err);
      resolve(gzipBuffer as Buffer);
    });
  });
}

function mergeCustomizer(objValue: any, srcValue: any) {
  if (lodash.isPlainObject(objValue) && lodash.isPlainObject(srcValue)) {
    return lodash.merge(objValue, srcValue);
  } else {
    return srcValue;
  }
}

class FileToAliOssWebpackPlugin {
  private config: OSSPluginConfig;
  private ossClient: AliOSSClient;
  private finalPrefix: string | undefined;

  constructor(config?: Partial<OSSPluginConfig>) {
    const envConfig = {
      auth: {
        accessKeyId:
          process.env[
            `${
              (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
            }WEBPACK_ALIOSS_PLUGIN_ACCESS_KEY_ID`
          ] || "",
        accessKeySecret:
          process.env[
            `${
              (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
            }WEBPACK_ALIOSS_PLUGIN_ACCESS_KEY_SECRET`
          ] || "",
        bucket:
          process.env[
            `${
              (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
            }WEBPACK_ALIOSS_PLUGIN_BUCKET`
          ] || "",
        region:
          process.env[
            `${
              (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
            }WEBPACK_ALIOSS_PLUGIN_REGION`
          ] || "",
      },
      enableLog: isTruthy(
        process.env[
          `${
            (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
          }WEBPACK_ALIOSS_PLUGIN_ENABLE_LOG`
        ] || ""
      ),
      ignoreErrors: isTruthy(
        process.env[
          `${
            (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
          }WEBPACK_ALIOSS_PLUGIN_IGNORE_ERRORS`
        ] || ""
      ),
      removeMode: isTruthy(
        process.env[
          `${
            (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
          }WEBPACK_ALIOSS_PLUGIN_REMOVE_MODE`
        ] || ""
      ),
      ossBaseDir:
        process.env[
          `${
            (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
          }WEBPACK_ALIOSS_PLUGIN_OSS_BASE_DIR`
        ] || "",
      prefix:
        process.env[
          `${
            (config || {}).envPrefix || DEFAULT_CONFIG.envPrefix
          }WEBPACK_ALIOSS_PLUGIN_PREFIX`
        ] || "",
    };
    this.config = lodash.mergeWith(
      lodash.cloneDeep(DEFAULT_CONFIG),
      envConfig,
      config || {},
      mergeCustomizer
    );
    if (typeof this.config.retry !== "number" || this.config.retry < 0) {
      this.config.retry = 0;
    }
    this.calculatePrefix();
    this.log("Default configuration:", DEFAULT_CONFIG);
    this.log("Environment configuration:", envConfig);
    this.log("Project configuration:", config);
    this.log("Final configuration:", this.config);
    // Initialize Aliyun OSS client
    this.ossClient = new AliOSSClient(this.config.auth);
  }

  apply(compiler: any) {
    if (compiler.hooks && compiler.hooks.emit) {
      // Webpack 5
      compiler.hooks.emit.tapAsync(
        "WebpackAliOSSPlugin",
        (compilation: any, callback: () => void) => {
          this.onEmit(compilation, callback);
        }
      );
    } else {
      compiler.plugin("emit", (compilation: any, callback: () => void) => {
        this.onEmit(compilation, callback);
      });
    }
  }

  private async onEmit(compilation: any, callback: () => void) {
    const files = this.pickupAssetFiles(compilation);
    this.log(`${green("\nOSS Upload started...")}`);
    try {
      await this.uploadFiles(files, compilation);
      this.log(`${green("OSS Upload completed\n")}`);
    } catch (err: any) {
      this.log(
        `${red("OSS Upload error")}::: ${red(err.code)}-${red(err.name)}: ${red(
          err.message
        )}`
      );
      if (!this.config.ignoreErrors) {
        compilation.errors.push(err);
      }
    }
    callback();
  }

  private calculatePrefix() {
    if (this.finalPrefix) return this.finalPrefix;
    // If 'prefix' is set, ignore 'ossBaseDir' and 'projectName'
    if (this.config.prefix) {
      this.finalPrefix = this.config.prefix;
    } else {
      // Use 'ossBaseDir' and 'projectName'
      // If 'projectName' is not available, extract it from package.json
      this.config.projectName =
        this.config.projectName || this.getNpmProjectName();
      if (!this.config.projectName) {
        // If 'projectName' is not available, use 'ossBaseDir' as the upload directory
        this.warn(`Using default upload directory: ${this.config.ossBaseDir}`);
        this.finalPrefix = this.config.ossBaseDir;
      } else {
        this.finalPrefix = `${this.config.ossBaseDir}/${this.config.projectName}`;
      }
    }
    this.log("Using OSS directory:", this.finalPrefix);
    return this.finalPrefix;
  }

  private async uploadFiles(files: any[], compilation: any) {
    let currentIndex = 1;
    for (const file of files) {
      file.$retryTime = 0;
      const uploadName = `${this.calculatePrefix()}/${file.name}`.replace(
        "//",
        "/"
      );
      // Check if the file exists before uploading
      if (this.config.existCheck !== true) {
        await this.uploadFile(
          file,
          currentIndex++,
          files,
          compilation,
          uploadName
        );
      } else {
        try {
          const result = await (this.ossClient as any).list({
            prefix: uploadName,
            "max-keys": 50,
          });
          const existingFiles = (result.objects || []).filter(
            (item: any) => item.name === uploadName
          );
          if (existingFiles && existingFiles.length > 0) {
            const timeStr = getTimeStr(new Date(existingFiles[0].lastModified));
            this.log(
              `${green(
                "Already exists, skipped upload"
              )} (Uploaded at ${timeStr}) ${++currentIndex}/${
                files.length
              }: ${uploadName}`
            );
            if (this.config.removeMode) {
              delete compilation.assets[file.name];
            }
          } else {
            throw new Error("Not exist, need to upload");
          }
        } catch (err) {
          await this.uploadFile(
            file,
            currentIndex++,
            files,
            compilation,
            uploadName
          );
        }
      }
    }
  }

  private async uploadFile(
    file: any,
    currentIndex: number,
    files: any[],
    compilation: any,
    uploadName: string
  ) {
    const totalFiles = files.length;
    const contentBuffer = await getFileContentBuffer(file, this.config.useGzip);
    const options = this.getUploadOptions(this.config.useGzip);
    for (let retry = 1; retry <= this.config.retry + 1; retry++) {
      try {
        this.log(
          `Uploading ${currentIndex}/${totalFiles}: ${
            retry > 1 ? `Retry ${retry - 1}` : ""
          }`,
          uploadName
        );
        await this.ossClient.put(uploadName, contentBuffer, options);
        this.log(
          `Upload successful ${currentIndex}/${totalFiles}: ${uploadName}`
        );
        if (this.config.removeMode) {
          delete compilation.assets[file.name];
        }
        return;
      } catch (err) {
        if (retry > this.config.retry) {
          throw err;
        }
      }
    }
  }

  private getUploadOptions(useGzip: boolean) {
    const hasValidOptions = lodash.isPlainObject(this.config.options);
    if (useGzip) {
      if (hasValidOptions) {
        if (!this.config.options.headers) {
          this.config.options.headers = {};
        }
        this.config.options.headers["Content-Encoding"] = "gzip";
        return this.config.options;
      } else {
        return {
          headers: { "Content-Encoding": "gzip" },
        };
      }
    } else {
      return hasValidOptions ? this.config.options : undefined;
    }
  }

  private pickupAssetFiles(compilation: any) {
    const matchedAssets: any = {};
    const assetKeys = Object.keys(compilation.assets);
    for (const key of assetKeys) {
      if (!this.config.exclude.test(key)) {
        matchedAssets[key] = compilation.assets[key];
      }
    }
    return lodash.map(matchedAssets, (value, name) => ({
      name,
      path: value.existsAt,
      content: value.source(),
    }));
  }

  private getNpmProjectName() {
    try {
      const pkg = require(pathUtils.resolve(process.env.PWD!, "package.json"));
      return pkg.name;
    } catch (e) {
      return "";
    }
  }

  private log(...messages: any[]) {
    this.config.enableLog &&
      console.log(
        chalkUtils.bgMagenta("[webpack-alioss-plugin]:"),
        ...messages
      );
  }

  private warn(...messages: any[]) {
    console.warn(chalkUtils.bgMagenta("[webpack-alioss-plugin]:"), ...messages);
  }
}
module.exports = FileToAliOssWebpackPlugin;
