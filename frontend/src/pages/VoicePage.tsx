import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Sparkles, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { api } from '../services/api';

export const VoicePage = () => {
  const personaId = localStorage.getItem('selectedPersona') || 'krishna';
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [statusText, setStatusText] = useState('Tap microphone to start speaking');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const personaConfig: Record<string, { core: string; glow: string; name: string; emoji: string; pitch: number; rate: number }> = {
    krishna: { core: 'from-blue-500 to-emerald-400', glow: 'bg-blue-500', name: 'Krishna', emoji: '🦚', pitch: 0.9, rate: 0.95 },
    chhava: { core: 'from-amber-500 to-red-500', glow: 'bg-amber-600', name: 'Chhava', emoji: '🦁', pitch: 1.1, rate: 1.05 },
    chanakya: { core: 'from-purple-500 to-indigo-500', glow: 'bg-purple-600', name: 'Chanakya', emoji: '📜', pitch: 0.85, rate: 1.0 },
  };

  const activePersona = personaConfig[personaId] || personaConfig.krishna;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Audio wave visualizer animation
  useEffect(() => {
    if (!isListening && !isSpeaking) {
      setVolume(1);
      return;
    }

    const interval = setInterval(() => {
      setVolume(Math.random() * 0.4 + 1.1);
    }, 120);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const speakText = (text: string) => {
    if (isMuted || !synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = activePersona.pitch;
    utterance.rate = activePersona.rate;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText(`${activePersona.name} is speaking...`);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText("Listening for your thoughts...");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusText("Tap microphone to speak");
    };

    synthRef.current.speak(utterance);
  };

  const handleToggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatusText("Thinking...");
      return;
    }

    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText("Listening... speak freely");
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setTranscript(current);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (transcript.trim()) {
        setStatusText(`${activePersona.name} is formulating wisdom...`);
        try {
          const res = await api.post('/chat', {
            message: transcript,
            persona_id: personaId
          });
          const answer = res.data.response;
          setAiResponse(answer);
          speakText(answer);
        } catch (err) {
          console.error(err);
          const fallback = "I heard you clearly. Let us reflect on this together.";
          setAiResponse(fallback);
          speakText(fallback);
        }
      } else {
        setStatusText("Tap microphone to speak");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setStatusText("Audio paused. Tap microphone to speak.");
    }
  };

  return (
    <div className="flex flex-col h-full relative items-center justify-between p-4 md:p-8">
      
      {/* Top Session Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{activePersona.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Voice Session • {activePersona.name}
            </h1>
            <p className="text-xs text-text-secondary">Speech-to-Text & Real-Time Synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Interactive Orb Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl my-8">
        
        <div className="relative w-72 h-72 flex items-center justify-center mb-10">
          
          {/* Animated Wave Ripples */}
          {(isListening || isSpeaking) && (
            <>
              <motion.div 
                className={`absolute w-full h-full rounded-full ${activePersona.glow}/20 blur-[25px]`}
                animate={{ scale: volume * 1.4, opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 0.2 }}
              />
              <motion.div 
                className={`absolute w-full h-full rounded-full ${activePersona.glow}/15 blur-[45px]`}
                animate={{ scale: volume * 1.8, opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.25 }}
              />
            </>
          )}

          {!isListening && !isSpeaking && (
            <motion.div 
              className={`absolute w-56 h-56 rounded-full ${activePersona.glow}/15 blur-[35px]`}
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Core Orb */}
          <motion.div 
            className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-br ${activePersona.core} shadow-[0_0_50px_rgba(0,0,0,0.6)] flex items-center justify-center border-2 border-white/20`}
            animate={isListening || isSpeaking ? { scale: volume } : { scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <span className="text-4xl">{activePersona.emoji}</span>
          </motion.div>
        </div>

        {/* Live Subtitle / Transcript Drawer */}
        <div className="w-full text-center space-y-2 min-h-[70px] px-4">
          <p className="text-sm font-semibold text-primary tracking-wide">
            {statusText}
          </p>
          {transcript && (
            <p className="text-xs text-text-secondary bg-surface/60 border border-border p-2.5 rounded-xl">
              " {transcript} "
            </p>
          )}
          {aiResponse && !isListening && (
            <p className="text-xs text-text-primary/90 bg-primary/10 border border-primary/30 p-3 rounded-xl max-h-24 overflow-y-auto custom-scrollbar">
              {aiResponse}
            </p>
          )}
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-6 pb-4">
        {isSpeaking && (
          <button
            onClick={handleStopSpeaking}
            className="p-3 rounded-full bg-surface border border-border text-text-secondary hover:text-text-primary transition-all hover:scale-105"
            title="Stop Speaking"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        )}

        <button 
          onClick={handleToggleListening}
          className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
            isListening 
              ? "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110 animate-pulse" 
              : "primary-button shadow-primary/30 hover:scale-105"
          )}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        {aiResponse && (
          <button
            onClick={() => speakText(aiResponse)}
            className="p-3 rounded-full bg-surface border border-border text-text-secondary hover:text-text-primary transition-all hover:scale-105"
            title="Replay Voice"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
};

export default VoicePage;
