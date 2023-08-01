const  FileToAliOssWebpackPlugin =require('../src/index')
import {OSSPluginConfig} from '../src/index'

jest.mock("ali-oss");

describe("FileToAliOssWebpackPlugin", () => {
  let plugin: typeof FileToAliOssWebpackPlugin;
  let mockCompilation: any;
  const mockConfig: OSSPluginConfig = {
    auth: {
      accessKeyId: "your-access-key-id",
      accessKeySecret: "your-access-key-secret",
      bucket: "your-bucket",
      region: "your-region",
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

  beforeEach(() => {
    mockCompilation = {
      assets: {
        "file1.js": {
          existsAt: "/path/to/file1.js",
          source: () => "console.log('Hello, World!');",
        },
        "file2.css": {
          existsAt: "/path/to/file2.css",
          source: () => "body { color: red; }",
        },
      },
      errors: [],
    };
    plugin = new FileToAliOssWebpackPlugin(mockConfig);
  });

  it("should calculate the finalPrefix correctly when prefix is set", () => {
    const config = { ...mockConfig, prefix: "test-prefix" };
    plugin = new FileToAliOssWebpackPlugin(config);
    expect(plugin["calculatePrefix"]()).toEqual("test-prefix");
  });

  it("should calculate the finalPrefix correctly when projectName is set", () => {
    const config = { ...mockConfig, projectName: "test-project" };
    plugin = new FileToAliOssWebpackPlugin(config);
    expect(plugin["calculatePrefix"]()).toEqual("auto_upload_ci/test-project");
  });

  it("should calculate the finalPrefix correctly when projectName is not set", () => {
    expect(plugin["calculatePrefix"]()).toEqual("auto_upload_ci");
  });
});
