import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle, RefreshCw, PlusCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceRecorderProps {
  onTranscriptComplete: (text: string) => void;
}

export default function VoiceRecorder({ onTranscriptComplete }: VoiceRecorderProps) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'success' | 'error'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [simulatedVolume, setSimulatedVolume] = useState<number[]>(Array(10).fill(10));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for duration tracking
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Simulate a nice bouncing visualizer wave
      volumeIntervalRef.current = setInterval(() => {
        setSimulatedVolume(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 45) + 5)
        );
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      if (status !== 'success') {
        setSeconds(0);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    };
  }, [status]);

  const startRecording = async () => {
    setErrorMessage('');
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = language === 'English' 
        ? 'Your browser does not support audio recording features.' 
        : 'आपका ब्राउज़र ऑडियो रिकॉर्डिंग का समर्थन नहीं करता है।';
      setErrorMessage(err);
      setStatus('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine best supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleTranscribe(audioBlob, mimeType);
        
        // Stop all tracks to release the microphone resource
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setStatus('recording');
      setSeconds(0);
    } catch (err: any) {
      console.error('Error starting media recorder:', err);
      const deniedMsg = language === 'English'
        ? 'Microphone access denied. Please grant permission in your browser.'
        : 'माइक्रोफ़ोन एक्सेस अस्वीकृत। कृपया अपने ब्राउज़र में अनुमति प्रदान करें।';
      setErrorMessage(deniedMsg);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setStatus('transcribing');
    }
  };

  const handleTranscribe = async (audioBlob: Blob, mimeType: string) => {
    try {
      // If audio file is too small (e.g., less than 2KB) or user didn't speak long enough, stop early with warning
      if (audioBlob.size < 2000 || seconds < 1) {
        const noSpeechMsg = language === 'English'
          ? 'No speech detected. Please speak clearly into your microphone.'
          : 'कोई आवाज़ नहीं मिली। कृपया माइक्रोफ़ोन में स्पष्ट रूप से बोलें।';
        setErrorMessage(noSpeechMsg);
        setStatus('error');
        return;
      }

      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        // Add AbortController for a 10s network timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000);

        try {
          const base64data = reader.result as string;
          // Strip the data:audio/...;base64, prefix
          const base64Encoded = base64data.split(',')[1];

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              audioBase64: base64Encoded,
              mimeType: mimeType,
            }),
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('Server responded with an error during transcription');
          }

          const data = await response.json();
          if (data.transcript && data.transcript.trim().length > 0) {
            onTranscriptComplete(data.transcript);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
          } else {
            throw new Error('No speech detected in the audio.');
          }
        } catch (innerErr: any) {
          clearTimeout(timeoutId);
          console.error('Transcription inner error:', innerErr);
          const failMsg = language === 'English'
            ? 'No clear speech detected. Please speak clearly or type manually.'
            : 'स्पष्ट आवाज़ नहीं मिली। कृपया साफ़ बोलें या मैन्युअल रूप से लिखें।';
          setErrorMessage(failMsg);
          setStatus('error');
        }
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      const failMsg = language === 'English'
        ? 'Could not transcribe voice note. Please try again or type manually.'
        : 'वॉयस नोट का अनुवाद नहीं किया जा सका। कृपया पुनः प्रयास करें या मैन्युअल रूप से लिखें।';
      setErrorMessage(failMsg);
      setStatus('error');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 mt-3 animate-fade-in shadow-inner w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* State Information */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {status === 'idle' && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {language === 'English' ? 'Speak to Describe' : 'बोलकर विवरण दर्ज करें'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate sm:normal-case">
                  {language === 'English' 
                    ? 'Record up to 1 minute. Supports English, Hindi, or Hinglish.' 
                    : '1 मिनट तक रिकॉर्ड करें। अंग्रेजी, हिंदी या हिंग्लिश का समर्थन करता है।'}
                </p>
              </div>
            </div>
          )}

          {status === 'recording' && (
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-red-600 uppercase tracking-wider">
                  {language === 'English' ? 'Recording Voice' : 'आवाज रिकॉर्ड हो रही है'}
                </p>
                <div className="flex items-center gap-2 mt-0.5 min-w-0 overflow-hidden">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white border px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                    {formatTime(seconds)}
                  </span>
                  {/* Bouncing audio wave simulation */}
                  <div className="flex items-end gap-0.5 h-4.5 overflow-hidden shrink-0">
                    {simulatedVolume.map((height, i) => (
                      <div 
                        key={i} 
                        className="w-[2.5px] bg-red-600 rounded-full transition-all duration-100 shrink-0" 
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'transcribing' && (
            <div className="flex items-center gap-2.5 min-w-0">
              <Loader2 className="w-5 h-5 animate-spin text-blue-900 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {language === 'English' ? 'AI Speech-to-Text Active' : 'AI स्पीच-टू-टेक्स्ट सक्रिय है'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {language === 'English' 
                    ? 'Transcribing your voice note with Gemini...' 
                    : 'जेमिनी के साथ आपके वॉयस नोट का अनुवाद किया जा रहा है...'}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-800 truncate">
                  {language === 'English' ? 'Transcript Added!' : 'विवरण में अनुवाद जोड़ा गया!'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {language === 'English' 
                    ? 'Added directly to your issue description above.' 
                    : 'ऊपर आपकी शिकायत के विवरण में सीधे जोड़ दिया गया है।'}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-red-800">
                  {language === 'English' ? 'Recording Failed' : 'रिकॉर्डिंग विफल रही'}
                </p>
                <p className="text-[10px] text-red-600 font-medium line-clamp-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full sm:w-auto shrink-0 flex justify-end">
          {status === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-950 text-white text-xs font-extrabold uppercase tracking-wider py-2.5 px-4.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Mic className="w-4 h-4 text-white" />
              {language === 'English' ? 'Start Voice' : 'वॉयस शुरू करें'}
            </button>
          )}

          {status === 'recording' && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider py-2.5 px-4.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <Square className="w-3.5 h-3.5 text-white animate-pulse" />
              {language === 'English' ? 'Stop & Transcribe' : 'रोकें और अनुवाद करें'}
            </button>
          )}

          {(status === 'transcribing') && (
            <button
              disabled
              type="button"
              className="w-full sm:w-auto bg-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider py-2.5 px-4.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {language === 'English' ? 'Processing...' : 'प्रक्रिया जारी है...'}
            </button>
          )}

          {status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{language === 'English' ? 'Done' : 'पूर्ण'}</span>
            </div>
          )}

          {status === 'error' && (
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-extrabold py-2 px-3.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {language === 'English' ? 'Retry' : 'पुनः प्रयास'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
