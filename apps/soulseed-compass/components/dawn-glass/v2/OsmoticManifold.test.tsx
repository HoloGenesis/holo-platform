import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OsmoticManifold } from "./OsmoticManifold";

describe("OsmoticManifold (render contract)", () => {
  it("binds the default filter url and renders children inside", () => {
    const html = renderToStaticMarkup(
      <OsmoticManifold>
        <p>glass content</p>
      </OsmoticManifold>
    );
    expect(html).toContain("filter:url(#biologicalRefraction)");
    expect(html).toContain("isolation:isolate");
    expect(html).toContain("will-change:filter");
    expect(html).toContain("<p>glass content</p>");
  });

  it("filterId prop overrides the filter URL", () => {
    const html = renderToStaticMarkup(
      <OsmoticManifold filterId="customRefraction">x</OsmoticManifold>
    );
    expect(html).toContain("filter:url(#customRefraction)");
    expect(html).not.toContain("biologicalRefraction");
  });

  it("merges className and style props (caller style wins on overlap)", () => {
    const html = renderToStaticMarkup(
      <OsmoticManifold className="layout-x" style={{ maxWidth: 960, position: "absolute" }}>
        x
      </OsmoticManifold>
    );
    expect(html).toContain('class="layout-x"');
    expect(html).toContain("max-width:960px");
    expect(html).toContain("position:absolute"); // caller override applied
    expect(html).toContain("filter:url(#biologicalRefraction)"); // binding kept
  });
});
