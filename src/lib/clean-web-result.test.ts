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

  it("removes image links, empty links and bare URLs", () => {
    expect(cleanWebText("![Google](https://search.google/icon.png) ## How to Use [](https://osmand.net/docs/x#ho"))
      .toBe("How to Use");
  });

  it("removes code fences", () => {
    expect(cleanWebText("# Search by name Sample request ``` {"))
      .toBe("Search by name Sample request");
  });
});