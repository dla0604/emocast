# EmoCast: 감정 맞춤 오디오 리더

EmoCast는 긴 글을 들을 때 기계적인 억양으로 몰입하기 어려운 문제를 개선하기 위한 오디오 리더입니다. 문맥에 담긴 감정에 맞춰 목소리 스타일을 조정하고, 대화와 서술을 구분해 더 자연스러운 청취 경험을 만드는 것을 목표로 합니다.

## 현재 프로토타입

이 저장소에는 첫 사용자 흐름을 확인하기 위한 클라이언트 전용 웹 프로토타입이 있습니다.

- 한국어 텍스트를 입력하고 문장별 미리보기를 확인합니다.
- 따옴표로 감싼 문장을 대화, 나머지를 서술로 표시합니다.
- 간단한 한국어 키워드 규칙으로 기쁨, 슬픔, 긴장, 차분함을 표시합니다.
- 브라우저의 기본 `SpeechSynthesis` 음성으로 문장을 순서대로 재생합니다.

감정 분류는 AI 모델이 아닌 키워드 기반 규칙이며, 문맥을 완전히 이해하지 못할 수 있습니다. 감정별 속도와 음높이는 데모용 기본값입니다. 음성 재생 및 한국어 음성의 지원 여부와 품질은 브라우저와 기기에 따라 다릅니다. 텍스트와 오디오는 서버로 전송되거나 저장되지 않습니다.

## 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

## 테스트 및 빌드

```bash
npm run lint
npm test
npm run build
```

GitHub Actions는 Node.js 20, 22, 24와 Ubuntu/Windows 조합으로 테스트합니다. 문서만 바뀐 경우 CI를 건너뛰며, 성공한 `main` 푸시에서 웹 앱 파일이 변경된 경우에만 GitHub Pages 배포를 시도합니다. 캐시 측정 방법과 CI 최적화 내역은 [CI 최적화 리포트](./.github/reports/CI_OPTIMIZATION_REPORT.md)를 참고하세요. PR의 `npm Cache Benchmark` 워크플로에서 cold/warm 설치 시간을 동일한 실행기에서 비교하며, 측정 결과는 `npm-cache-benchmark` 아티팩트로 제공됩니다.

## 향후 제품 방향

향후에는 실제 문맥 기반 감정 분석, 대화 화자 분리, 더 자연스러운 TTS, 오디오 저장과 공유를 검토할 수 있습니다. README에 언급된 OpenAI TTS, ElevenLabs, VITS, KoBERT, FastAPI, PostgreSQL, Next.js/React Native, S3, Docker 등은 후보 기술이며 현재 프로토타입에 연동되어 있지 않습니다.

## DORA 지표

주간 DORA 리포트는 GitHub Actions로 생성됩니다. 자세한 내용은 [DORA 주간 리포트](./DORA_WEEKLY_REPORT.md)를 참고하세요.
