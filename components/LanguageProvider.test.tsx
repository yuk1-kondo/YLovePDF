import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageProvider";

function Probe() {
  const { lang, setLang } = useLanguage();

  return (
    <>
      <span data-testid="current-lang">{lang}</span>
      <button type="button" onClick={() => setLang("ja")}>switch-ja</button>
    </>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "en";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads saved language from localStorage", async () => {
    window.localStorage.setItem("ylovepdf.lang", "ja");

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-lang").textContent).toBe("ja");
      expect(document.documentElement.lang).toBe("ja");
    });
  });

  it("continues to work when localStorage access throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "switch-ja" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-lang").textContent).toBe("ja");
      expect(document.documentElement.lang).toBe("ja");
    });
  });
});
