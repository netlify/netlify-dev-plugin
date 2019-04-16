const { expect, test } = require("@oclif/test");
// const nock = require("nock");

describe("auth:whoami", () => {
  test
    .command(["functions:list"])
    .it("shows user email when logged in", ctx => {
      expect(ctx.stdout).to.equal("jeff@example.com\n");
    });
});
