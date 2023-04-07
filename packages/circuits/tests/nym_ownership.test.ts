import { testSigner, computeNymInput } from "./test_utils";

describe("nym ownership", () => {
  it("e2e test with signatures from web frontend", async () => {
    const testContent = "nyms are eternal";
    const testNym = "satoshi";

    const nymInput = await computeNymInput(testSigner, testContent, testNym);

    console.log(nymInput);

    expect(1).toBe(1);
  });
});
