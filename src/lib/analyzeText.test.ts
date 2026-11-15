import { describe, expect, it } from "vitest";
import { analyzeText } from "./analyzeText";

describe("analyzeText", () => {
  it("splits sentences and marks dialogue and emotion labels", () => {
    expect(analyzeText('그는 웃으며 말했다. "정말 좋아!" 그녀는 눈물을 흘렸다.')).toEqual([
      {
        text: "그는 웃으며 말했다.",
        kind: "narration",
        style: { emotion: "joy", label: "기쁨", rate: 1.08, pitch: 1.12 },
      },
      {
        text: '"정말 좋아!"',
        kind: "dialogue",
        style: { emotion: "joy", label: "기쁨", rate: 1.08, pitch: 1.12 },
      },
      {
        text: "그녀는 눈물을 흘렸다.",
        kind: "narration",
        style: { emotion: "sadness", label: "슬픔", rate: 0.9, pitch: 0.88 },
      },
    ]);
  });

  it("returns no segments for empty or whitespace-only input", () => {
    expect(analyzeText(" \n\t ")).toEqual([]);
  });

  it("uses the neutral style when no rule matches", () => {
    expect(analyzeText("바람이 분다.")[0]?.style).toEqual({
      emotion: "neutral",
      label: "차분함",
      rate: 1,
      pitch: 1,
    });
  });

  it("does not split a sentence at a newline only once a sentence is complete", () => {
    expect(analyzeText("첫 문장\n다음 문장")).toHaveLength(2);
  });
});
