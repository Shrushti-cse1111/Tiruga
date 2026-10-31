export class SpeechService {
  static isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  static startListening(
    onResult: (text: string) => void,
    onError: (err: any) => void,
    lang: string = 'en-IN'
  ): () => void {
    if (!this.isSpeechRecognitionSupported()) {
      onError(new Error('Speech recognition not supported in this browser. Please type.'));
      return () => {};
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'kn' ? 'kn-IN' : (lang === 'mr' ? 'mr-IN' : 'en-IN');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error);
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      };
    } catch (e) {
      onError(e);
      return () => {};
    }
  }

  static speak(text: string, lang: string = 'en') {
    if (!this.isSpeechSynthesisSupported()) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'kn' ? 'kn-IN' : (lang === 'mr' ? 'mr-IN' : 'en-IN');
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}
