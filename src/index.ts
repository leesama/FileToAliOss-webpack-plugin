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
  useGzip: boolean;
};

class FileToAliOssWebpackPlugin {
  private config: OSSPluginConfig;
  private ossClient: AliOSSClient;

  constructor(config: OSSPluginConfig) {
    this.config = config;
    this.ossClient = new AliOSSClient(this.config.auth);
  }

  async uploadFile(file: any, uploadName: string) {
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
}

export default FileToAliOssWebpackPlugin;
