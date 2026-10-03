import { describe, expect, it } from "vitest";
import { cleanWebDescription, cleanWebText } from "./clean-web-result";

describe("web result text cleaning", () => {
  it("removes pagination, markdown, HTML, and separator noise", () => {
    expect(cleanWebText("## **Title** Page 1Page 2Page 156 || || <br> [Useful link](https://example.com)"))
      .toBe("Title Useful link");
  });

  it("removes malformed company-list noise", () => {
    expect(cleanWebText("_List of companies Page 1 Page 2 Real business information"))
      .toBe("Real business information");
  });

  it("uses the requested fallback for garbage", () => {
    expect(cleanWebDescription("|| || **"))
      .toBe("No description - click AI Summary");
  });
});