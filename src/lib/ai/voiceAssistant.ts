// Web Speech API Assistant for VoltGhost ("Hey Ghost")

export class VoiceAssistant {
  private recognition: any = null;
  private isListening = false;
  private ttsEnabled = true;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  setTtsEnabled(enabled: boolean) {
    this.ttsEnabled = enabled;
  }

  startListening(
    onInterim: (transcript: string) => void,
    onFinal: (transcript: string) => void,
    onError: (err: any) => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser.');
      return;
    }
    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          onFinal(event.results[i][0].transcript);
          this.isListening = false;
          return;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onInterim(interim);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      onError(e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, lang: string = 'en-US') {
    if (!this.ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    // Clean markdown asterisks
    const clean = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceAssistant = new VoiceAssistant();
