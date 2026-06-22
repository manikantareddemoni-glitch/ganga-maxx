import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneCall, X, Sparkles, Volume2 } from 'lucide-react';
import { api } from '../lib/api';

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState("Hello! I am the Ganga Maxx AI Agent. I can answer calls and resolve doubts. Tap the microphone to speak to me.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        transcriptRef.current = result;
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        const finalTranscript = transcriptRef.current;
        if (finalTranscript.trim().length > 0) {
          sendToAi(finalTranscript);
        }
        transcriptRef.current = '';
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
      window.speechSynthesis.cancel();
    }
  };

  const sendToAi = async (text) => {
    setAiResponse("Thinking...");
    try {
      const res = await api.post('/ai/voice-chat', { message: text });
      const reply = res.data.reply;
      setAiResponse(reply);
      speak(reply);
    } catch (e) {
      console.error(e);
      const errReply = "Sorry, I am having trouble connecting to my neural network. Please check your internet or API key.";
      setAiResponse(errReply);
      speak(errReply);
    }
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good female English voice if available
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || (v.lang.includes('en') && v.name.includes('Female')));
    if (goodVoice) utterance.voice = goodVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow hover:bg-brand-500 hover:shadow-glow-hover hover:scale-105 transition-all duration-300"
        title="AI Voice Agent"
      >
        <PhoneCall size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10"
          >
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-200" />
                  <h3 className="font-bold">AI Voice Agent</h3>
                </div>
                <button onClick={() => { setIsOpen(false); window.speechSynthesis.cancel(); recognitionRef.current?.stop(); }} className="text-white/70 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <p className="mt-1 text-xs text-brand-100">Live Browser Simulation</p>
            </div>
            
            <div className="p-5">
              <div className="mb-6 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 min-h-[100px] flex items-center justify-center text-center relative overflow-hidden">
                {isSpeaking && (
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-brand-500/10 dark:bg-brand-400/10 pointer-events-none" 
                  />
                )}
                {isSpeaking ? <Volume2 className="absolute top-2 left-2 text-brand-500/50" size={16} /> : null}
                <p className="relative z-10">{aiResponse}</p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isListening ? "Listening..." : "Tap to Speak"}
                </p>
                <button
                  onClick={toggleListen}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-105 ${
                    isListening ? 'bg-rose-500 shadow-rose-500/40 animate-pulse' : 'bg-brand-500 shadow-brand-500/40 hover:bg-brand-400'
                  }`}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
              </div>
              
              {transcript && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">You said:</p>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300">"{transcript}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
