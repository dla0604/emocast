export type Emotion = "joy" | "sadness" | "tension" | "neutral";
export type SegmentKind = "dialogue" | "narration";

export interface SpeechStyle {
  emotion: Emotion;
  label: string;
  rate: number;
  pitch: number;
}

export interface TextSegment {
  text: string;
  kind: SegmentKind;
  style: SpeechStyle;
}

const emotionRules: Array<{ emotion: Emotion; keywords: string[] }> = [
  {
    emotion: "tension",
    keywords: ["위험", "도망", "두려", "무서", "긴장", "소리쳤", "급히", "떨렸다"],
  },
  {
    emotion: "sadness",
    keywords: ["슬프", "눈물", "울었", "울고", "외롭", "그리웠", "아팠"],
  },
  {
    emotion: "joy",
    keywords: ["기뻐", "기뻤", "기쁨", "행복", "웃었", "웃으며", "좋아", "반가", "신났"],
  },
];

const speechStyles: Record<Emotion, SpeechStyle> = {
  joy: { emotion: "joy", label: "기쁨", rate: 1.08, pitch: 1.12 },
  sadness: { emotion: "sadness", label: "슬픔", rate: 0.9, pitch: 0.88 },
  tension: { emotion: "tension", label: "긴장", rate: 1.15, pitch: 1.05 },
  neutral: { emotion: "neutral", label: "차분함", rate: 1, pitch: 1 },
};

function classifyEmotion(text: string): Emotion {
  for (const rule of emotionRules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.emotion;
    }
  }
  return "neutral";
}

function classifyKind(text: string): SegmentKind {
  return /["“”‘’「」『』]/u.test(text) ? "dialogue" : "narration";
}

export function analyzeText(input: string): TextSegment[] {
  const sentences = input.match(/[^.!?…\n]+(?:[.!?…]+[”’"')\]』」】]*)?/gu) ?? [];

  return sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((text) => {
      const emotion = classifyEmotion(text);
      return {
        text,
        kind: classifyKind(text),
        style: speechStyles[emotion],
      };
    });
}
