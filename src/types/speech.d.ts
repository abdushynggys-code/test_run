interface SpeechRecognitionResultLike { readonly 0: { transcript: string } }
interface SpeechRecognitionEventLike extends Event { readonly results: ArrayLike<SpeechRecognitionResultLike> }
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructor { new(): SpeechRecognitionLike }

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}
