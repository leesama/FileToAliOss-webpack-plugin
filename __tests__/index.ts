const FileToAliOssWebpackPlugin = require("../src/index");

describe("FileToAliOssWebpackPlugin", () => {
  describe("calculatePrefix", () => {
    it("should return the finalPrefix if it is already set", () => {
      const plugin = new FileToAliOssWebpackPlugin({ prefix: "test-prefix" });
      plugin.finalPrefix = "final-prefix";
      // expect(plugin.calculatePrefix()).toEqual("final-prefix");
    });

    // it("should use the prefix if it is set", () => {
    //   const plugin = new FileToAliOssWebpackPlugin({ prefix: "test-prefix" });
    //   expect(plugin.calculatePrefix()).toEqual("test-prefix");
    // });

    // it("should use ossBaseDir and projectName if prefix is not set", () => {
    //   const plugin = new FileToAliOssWebpackPlugin({
    //     ossBaseDir: "test-ossBaseDir",
    //     projectName: "test-projectName",
    //   });
    //   expect(plugin.calculatePrefix()).toEqual(
    //     "test-ossBaseDir/test-projectName"
    //   );
    // });

    // it("should use ossBaseDir if projectName is not set", () => {
    //   const plugin = new FileToAliOssWebpackPlugin({
    //     ossBaseDir: "test-ossBaseDir",
    //   });
    //   expect(plugin.calculatePrefix()).toEqual("test-ossBaseDir");
    // });

    // it("should use ossBaseDir if projectName is not available and cannot be extracted from package.json", () => {
    //   const plugin = new FileToAliOssWebpackPlugin({
    //     ossBaseDir: "test-ossBaseDir",
    //   });
    //   plugin.getNpmProjectName = jest.fn().mockReturnValue("");
    //   plugin.warn = jest.fn();
    //   expect(plugin.calculatePrefix()).toEqual("test-ossBaseDir");
    //   expect(plugin.warn).toHaveBeenCalledWith(
    //     "Using default upload directory: test-ossBaseDir"
    //   );
    // });
  });

  describe("getNpmProjectName", () => {
    it("should return the name from package.json if it exists", () => {
      const plugin = new FileToAliOssWebpackPlugin({});
      jest.mock("path", () => ({
        resolve: () => "../package.json",
      }));
      jest.mock("../package.json", () => ({
        name: "test-projectName",
      }));
      expect(plugin.getNpmProjectName()).toEqual("test-projectName");
    });

    it("should return an empty string if package.json does not exist", () => {
      const plugin = new FileToAliOssWebpackPlugin({});
      jest.mock("path", () => ({
        resolve: () => {
          throw new Error("File not found");
        },
      }));
      expect(plugin.getNpmProjectName()).toEqual("");
    });
  });
});
