import { useEffect, useRef, useState, type FormEvent } from "react";
import { analyzeText, type TextSegment } from "./lib/analyzeText";

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return null;
  }
  return window.speechSynthesis;
}

function App() {
  const [text, setText] = useState("");
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const playbackSession = useRef(0);
  const speechAvailable = getSpeechSynthesis() !== null;

  const stopPlayback = () => {
    playbackSession.current += 1;
    getSpeechSynthesis()?.cancel();
    setIsSpeaking(false);
  };

  useEffect(
    () => () => {
      playbackSession.current += 1;
      getSpeechSynthesis()?.cancel();
    },
    [],
  );

  const handleAnalyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    stopPlayback();
    setSpeechError("");
    setSegments(analyzeText(text));
  };

  const handlePlay = () => {
    const speech = getSpeechSynthesis();
    if (!speech || segments.length === 0) {
      return;
    }

    const session = ++playbackSession.current;
    speech.cancel();
    setSpeechError("");
    setIsSpeaking(true);

    const speakSegment = (index: number) => {
      if (session !== playbackSession.current) {
        return;
      }

      const segment = segments[index];
      if (!segment) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = "ko-KR";
      utterance.rate = segment.style.rate;
      utterance.pitch = segment.style.pitch;
      utterance.onend = () => speakSegment(index + 1);
      utterance.onerror = () => {
        if (session === playbackSession.current) {
          setSpeechError("음성을 재생하지 못했어요. 브라우저의 음성 설정을 확인해 주세요.");
          setIsSpeaking(false);
        }
      };

      try {
        speech.speak(utterance);
      } catch {
        setSpeechError("음성을 재생하지 못했어요. 브라우저의 음성 설정을 확인해 주세요.");
        setIsSpeaking(false);
      }
    };

    speakSegment(0);
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">EMOCAST · 감정 맞춤 오디오 리더</p>
        <h1>문장에 담긴 감정을<br />소리로 만나보세요.</h1>
        <p className="intro">
          글을 붙여 넣으면 문장과 대화문을 나누고, 감정에 어울리는 목소리로 읽어드려요.
        </p>
      </header>

      <section className="workspace" aria-label="텍스트 오디오 만들기">
        <form className="input-card" onSubmit={handleAnalyze}>
          <label htmlFor="story-text">읽고 싶은 글</label>
          <textarea
            id="story-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={'예: 오래 기다렸던 소식에 그녀는 활짝 웃었다.\n"정말 기뻐!"'}
            rows={6}
          />
          <div className="form-footer">
            <p>한국어 문장을 입력해 주세요.</p>
            <button type="submit" className="primary-button">감정 분석하기</button>
          </div>
        </form>

        <section className="result-card" aria-labelledby="result-title" aria-live="polite">
          <div className="result-heading">
            <div>
              <p className="eyebrow">YOUR LISTENING PREVIEW</p>
              <h2 id="result-title">감정 미리보기</h2>
            </div>
            {segments.length > 0 && (
              <span className="segment-count">{segments.length}개 문장</span>
            )}
          </div>

          {segments.length === 0 ? (
            <p className="empty-state">글을 입력하고 분석하면 문장별 감정을 보여드릴게요.</p>
          ) : (
            <>
              <ol className="segment-list">
                {segments.map((segment, index) => (
                  <li className="segment" key={`${index}-${segment.text}`}>
                    <span className={`emotion-tag emotion-${segment.style.emotion}`}>
                      {segment.style.label}
                    </span>
                    <span className="kind-tag">
                      {segment.kind === "dialogue" ? "대화" : "서술"}
                    </span>
                    <p>{segment.text}</p>
                  </li>
                ))}
              </ol>
              <div className="playback">
                {!speechAvailable && (
                  <p className="support-note" role="status">
                    이 브라우저에서는 음성 재생을 지원하지 않아요. 감정 미리보기는 계속 확인할 수 있어요.
                  </p>
                )}
                {speechError && <p className="error-note" role="alert">{speechError}</p>}
                <button
                  type="button"
                  className="play-button"
                  onClick={isSpeaking ? stopPlayback : handlePlay}
                  disabled={!speechAvailable}
                >
                  {isSpeaking ? "재생 정지" : "▶ 문장 듣기"}
                </button>
                <span>브라우저 기본 한국어 음성 사용</span>
              </div>
            </>
          )}
        </section>
      </section>

      <footer>
        <p>
          감정 분석은 키워드 기반 미리보기입니다. 음성 품질과 감정 표현은 브라우저 및 기기에 따라 달라질 수 있어요.
        </p>
      </footer>
    </main>
  );
}

export default App;
