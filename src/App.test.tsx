import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("EmoCast reading flow", () => {
  it("shows sentence emotion and dialogue labels after analysis", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("읽고 싶은 글"), {
      target: { value: '그는 웃으며 말했다. "정말 좋아!"' },
    });
    fireEvent.click(screen.getByRole("button", { name: "감정 분석하기" }));

    expect(screen.getByText("그는 웃으며 말했다.")).toBeInTheDocument();
    expect(screen.getByText('"정말 좋아!"')).toBeInTheDocument();
    expect(screen.getAllByText("기쁨")).toHaveLength(2);
    expect(screen.getByText("대화")).toBeInTheDocument();
  });

  it("speaks analyzed sentences with the mapped Korean style", () => {
    class MockUtterance {
      lang = "";
      rate = 1;
      pitch = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(readonly text: string) {}
    }

    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel },
    });

    render(<App />);
    fireEvent.change(screen.getByLabelText("읽고 싶은 글"), {
      target: { value: "정말 기뻤다!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "감정 분석하기" }));
    fireEvent.click(screen.getByRole("button", { name: "▶ 문장 듣기" }));

    expect(speak).toHaveBeenCalledOnce();
    const utterance = speak.mock.calls[0]?.[0] as MockUtterance;
    expect(utterance.text).toBe("정말 기뻤다!");
    expect(utterance.lang).toBe("ko-KR");
    expect(utterance.rate).toBe(1.08);
    expect(utterance.pitch).toBe(1.12);
  });
});
