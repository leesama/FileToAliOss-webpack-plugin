import FileToAliOssWebpackPlugin, { OSSPluginConfig } from "../src/index";

describe("FileToAliOssWebpackPlugin", () => {
  const mockAuthConfig = {
    accessKeyId: "test-access-key-id",
    accessKeySecret: "test-access-key-secret",
    bucket: "test-bucket",
    region: "test-region",
  };
  const mockPluginConfig: OSSPluginConfig = {
    auth: mockAuthConfig,
    useGzip: false,
  };
  const mockFile = {
    content: "test-file-content",
  };
  const mockUploadName = "test-upload-name";

  let plugin: FileToAliOssWebpackPlugin;

  beforeEach(() => {
    plugin = new FileToAliOssWebpackPlugin(mockPluginConfig);
  });

  describe("uploadFile", () => {
    it("uploads a file to AliOSS", async () => {
      const mockPut = jest.fn();
      plugin["ossClient"].put = mockPut;

      await plugin.uploadFile(mockFile, mockUploadName);

      expect(mockPut).toHaveBeenCalledWith(
        mockUploadName,
        Buffer.from(mockFile.content),
        undefined
      );
    });

    it("uploads a gzipped file to AliOSS if useGzip is true", async () => {
      const mockPut = jest.fn();
      plugin["ossClient"].put = mockPut;

      plugin = new FileToAliOssWebpackPlugin({
        ...mockPluginConfig,
        useGzip: true,
      });

      await plugin.uploadFile(mockFile, mockUploadName);

      expect(mockPut).toHaveBeenCalledWith(mockUploadName, expect.any(Buffer), {
        headers: { "Content-Encoding": "gzip" },
      });
    });
  });
});
