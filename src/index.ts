import AliOSSClient from "ali-oss";
import zlib from "zlib";

export type OSSAuthConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
};

export type OSSPluginConfig = {
  auth: OSSAuthConfig;
  useGzip: boolean;
};

class FileToAliOssWebpackPlugin {
  private config: OSSPluginConfig;
  private ossClient: AliOSSClient;

  constructor(config: OSSPluginConfig) {
    this.config = config;
    this.ossClient = new AliOSSClient(this.config.auth);
  }

  apply(compiler: any) {
    compiler.hooks.emit.tapPromise(
      "FileToAliOssWebpackPlugin",
      async (compilation: any) => {
        const files = this.pickupAssetFiles(compilation);
        await this.uploadFiles(files);
      }
    );
  }

  private async uploadFiles(files: any[]) {
    for (const file of files) {
      const uploadName = file.name;
      await this.uploadFile(file, uploadName);
    }
  }

  private async uploadFile(file: any, uploadName: string) {
    const contentBuffer = await this.getFileContentBuffer(file);
    await this.ossClient.put(
      uploadName,
      contentBuffer,
      this.getUploadOptions()
    );
  }

  private async getFileContentBuffer(file: any) {
    if (!this.config.useGzip) {
      return Buffer.from(file.content);
    }

    return new Promise<Buffer>((resolve, reject) => {
      zlib.gzip(Buffer.from(file.content), (err, gzipBuffer) => {
        if (err) reject(err);
        resolve(gzipBuffer as Buffer);
      });
    });
  }

  private getUploadOptions() {
    if (this.config.useGzip) {
      return {
        headers: { "Content-Encoding": "gzip" },
      };
    }
    return undefined;
  }

  private pickupAssetFiles(compilation: any) {
    const matchedAssets: any = {};
    const assetKeys = Object.keys(compilation.assets);
    for (const key of assetKeys) {
      matchedAssets[key] = compilation.assets[key];
    }
    return Object.keys(matchedAssets).map((name) => ({
      name,
      content: matchedAssets[name].source(),
    }));
  }
}

export default FileToAliOssWebpackPlugin;
