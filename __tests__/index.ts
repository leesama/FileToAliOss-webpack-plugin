const FileToAliOssWebpackPlugin = require("../src/index");
const mockUploadFile = require("./mockFile.png");

describe("FileToAliOssWebpackPlugin", () => {
  const mockAuthConfig = {
    accessKeyId: "test-access-key-id",
    accessKeySecret: "test-access-key-secret",
    bucket: "test-bucket",
    region: "test-region",
  };
  const mockPluginConfig = {
    auth: mockAuthConfig,
    useGzip: false,
  };
  const mockUploadName = "test-upload-name";

  let plugin: typeof FileToAliOssWebpackPlugin;

  beforeEach(() => {
    plugin = new FileToAliOssWebpackPlugin(mockPluginConfig);
  });

  describe("uploadFile", () => {
    it("uploads a file to AliOSS", async () => {
      const mockPut = jest.fn();
      plugin["ossClient"].put = mockPut;
      const files = [
        { name: "file1.txt", $retryTime: 0, content: mockUploadFile },
        { name: "file2.txt", $retryTime: 0, content: mockUploadFile },
      ];
      const compilation = { assets: { "file1.txt": {}, "file2.txt": {} } };
      await plugin.uploadFiles(files, compilation);
      expect(mockPut).toHaveBeenCalledWith(
        mockUploadName,
        Buffer.from(content),
        {}
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

  describe("apply", () => {
    it("uploads all files in the compilation to AliOSS", async () => {
      const mockCompilation = {
        assets: {
          "file1.js": {
            source: () => "test-file-1-content",
          },
          "file2.css": {
            source: () => "test-file-2-content",
          },
        },
      };
      const mockUploadFile = jest.fn();
      plugin.uploadFile = mockUploadFile;

      await plugin.apply(mockCompilation as any);

      expect(mockUploadFile).toHaveBeenCalledTimes(1);
      expect(mockUploadFile).toHaveBeenCalledWith(
        { content: "test-file-1-content" },
        "oss/dir/file1.js"
      );
    });

    it("skips files that match the exclude pattern", async () => {
      const mockCompilation = {
        assets: {
          "file1.js": {
            source: () => "test-file-1-content",
          },
          "file2.css": {
            source: () => "test-file-2-content",
          },
        },
      };
      const mockUploadFile = jest.fn();
      plugin.uploadFile = mockUploadFile;

      plugin = new FileToAliOssWebpackPlugin({
        ...mockPluginConfig,
        exclude: /file2\.css/,
      });

      await plugin.apply(mockCompilation as any);

      expect(mockUploadFile).toHaveBeenCalledTimes(1);
      expect(mockUploadFile).toHaveBeenCalledWith(
        { content: "test-file-1-content" },
        "oss/dir/file1.js"
      );
    });

    it("skips files that already exist on AliOSS if existCheck is true", async () => {
      const mockCompilation = {
        assets: {
          "file1.js": {
            source: () => "test-file-1-content",
          },
        },
      };
      const mockUploadFile = jest.fn();
      plugin.uploadFile = mockUploadFile;

      const mockHead = jest.fn(() => ({ status: 200 }));
      plugin["ossClient"].head = mockHead;

      plugin = new FileToAliOssWebpackPlugin({
        ...mockPluginConfig,
        existCheck: true,
      });

      await plugin.apply(mockCompilation as any);

      expect(mockUploadFile).toHaveBeenCalledTimes(0);
    });
  });
});
