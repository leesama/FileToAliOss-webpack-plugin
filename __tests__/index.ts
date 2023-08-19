const FileToAliOssWebpackPlugin = require("../src/index"); // 你的源文件路径
const AliOSSClient = require("ali-oss");
jest.mock("ali-oss");
let mockConfig = {
  auth: {
    accessKeyId: "id",
    accessKeySecret: "secret",
    bucket: "bucket",
    region: "region",
  },
  ossBaseDir: "baseDir",
  projectName: "projectName",
  prefix: "customPrefix",
};
describe("FileToAliOssWebpackPlugin", () => {
  // Mock the AliOSSClient constructor

  it("should create an instance of FileToAliOssWebpackPlugin", () => {
    const plugin = new FileToAliOssWebpackPlugin(mockConfig);
    expect(plugin).toBeInstanceOf(FileToAliOssWebpackPlugin);
  });

  it("should calculate the correct prefix", () => {
    const plugin = new FileToAliOssWebpackPlugin(mockConfig);
    const prefix = plugin.calculatePrefix();
    expect(prefix).toBe("customPrefix");
  });

  it("should upload files to OSS", async () => {
    const mockPut = jest.fn(() => Promise.resolve());
    const mockCompilation = {
      assets: {
        "file1.js": { existsAt: "/path/to/file1.js", source: () => "content1" },
        "file2.js": { existsAt: "/path/to/file2.js", source: () => "content2" },
      },
      errors: [],
    };

    const plugin = new FileToAliOssWebpackPlugin({
      auth: {
        accessKeyId: "id",
        accessKeySecret: "secret",
        bucket: "bucket",
        region: "region",
      },
      retry: 0,
      existCheck: false,
      ossBaseDir: "baseDir",
    });

    await plugin.onEmit(mockCompilation, () => {});
    expect(plugin.ossClient.put).toHaveBeenCalledTimes(2);
  });
});
