import React, { useState, useRef, useEffect } from 'react';
import './VoiceRecorder.css';

interface VoiceRecording {
  id: string;
  title: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
  activityId?: string;
  category: 'note' | 'feedback' | 'instruction' | 'announcement';
}

interface VoiceRecorderProps {
  onClose: () => void;
  onRecordingSaved: (recording: VoiceRecording) => void;
  activityId?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onClose,
  onRecordingSaved,
  activityId
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingCategory, setRecordingCategory] = useState<'note' | 'feedback' | 'instruction' | 'announcement'>('note');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // تحميل التسجيلات المحفوظة
  useEffect(() => {
    const savedRecordings = localStorage.getItem('voice_recordings');
    if (savedRecordings) {
      const parsed = JSON.parse(savedRecordings);
      setRecordings(parsed.map((rec: any) => ({
        ...rec,
        timestamp: new Date(rec.timestamp)
      })));
    }
  }, []);

  // حفظ التسجيلات
  const saveRecordings = (newRecordings: VoiceRecording[]) => {
    localStorage.setItem('voice_recordings', JSON.stringify(newRecordings));
    setRecordings(newRecordings);
  };

  // بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // إعداد AudioContext للتصور
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // بدء رسم الموجات الصوتية
      drawWaveform();

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording: VoiceRecording = {
          id: Date.now().toString(),
          title: recordingTitle || `تسجيل ${new Date().toLocaleTimeString('ar-MA')}`,
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          timestamp: new Date(),
          activityId,
          category: recordingCategory
        };

        setCurrentRecording(newRecording);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // بدء العداد
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('خطأ في الوصول للميكروفون:', error);
      alert('لا يمكن الوصول للميكروفون. تأكد من الأذونات.');
    }
  };

  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  // إيقاف مؤقت/استئناف
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  // رسم الموجات الصوتية
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // حفظ التسجيل
  const saveCurrentRecording = () => {
    if (currentRecording) {
      const updatedRecordings = [...recordings, currentRecording];
      saveRecordings(updatedRecordings);
      onRecordingSaved(currentRecording);
      setCurrentRecording(null);
      setRecordingTitle('');
      setRecordingTime(0);
    }
  };

  // تشغيل التسجيل
  const playRecording = (recording: VoiceRecording) => {
    if (playingId === recording.id) {
      setPlayingId(null);
      return;
    }

    const audio = new Audio(recording.url);
    audio.volume = volume;
    
    audio.onended = () => {
      setPlayingId(null);
    };

    audio.play();
    setPlayingId(recording.id);
  };

  // حذف التسجيل
  const deleteRecording = (id: string) => {
    const updatedRecordings = recordings.filter(rec => rec.id !== id);
    saveRecordings(updatedRecordings);
  };

  // تحويل الثواني لتنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // الحصول على أيقونة الفئة
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'note': return '📝';
      case 'feedback': return '💬';
      case 'instruction': return '📋';
      case 'announcement': return '📢';
      default: return '🎤';
    }
  };

  // تنظيف الموارد
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="voice-recorder-overlay">
      <div className="voice-recorder-container">
        {/* Header */}
        <div className="recorder-header">
          <h3>🎤 مسجل الصوت</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Recording Controls */}
        <div className="recording-controls">
          <div className="recording-info">
            <div className="recording-timer">
              <span className="timer-display">{formatTime(recordingTime)}</span>
              {isRecording && (
                <div className={`recording-indicator ${isPaused ? 'paused' : ''}`}>
                  ● {isPaused ? 'متوقف مؤقتاً' : 'جاري التسجيل'}
                </div>
              )}
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="waveform-container">
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="waveform-canvas"
            />
          </div>

          {/* Control Buttons */}
          <div className="control-buttons">
            {!isRecording ? (
              <button
                className="control-btn record-btn"
                onClick={startRecording}
              >
                🎤 بدء التسجيل
              </button>
            ) : (
              <>
                <button
                  className="control-btn pause-btn"
                  onClick={togglePause}
                >
                  {isPaused ? '▶️ استئناف' : '⏸️ إيقاف مؤقت'}
                </button>
                <button
                  className="control-btn stop-btn"
                  onClick={stopRecording}
                >
                  ⏹️ إيقاف
                </button>
              </>
            )}
          </div>

          {/* Volume Control */}
          <div className="volume-control">
            <label>🔊 مستوى الصوت:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Current Recording Preview */}
        {currentRecording && (
          <div className="current-recording">
            <h4>📝 معاينة التسجيل</h4>
            <div className="recording-form">
              <div className="form-group">
                <label>عنوان التسجيل:</label>
                <input
                  type="text"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  placeholder="أدخل عنوان للتسجيل"
                />
              </div>
              <div className="form-group">
                <label>فئة التسجيل:</label>
                <select
                  value={recordingCategory}
                  onChange={(e) => setRecordingCategory(e.target.value as any)}
                >
                  <option value="note">📝 ملاحظة</option>
                  <option value="feedback">💬 تعليق</option>
                  <option value="instruction">📋 تعليمات</option>
                  <option value="announcement">📢 إعلان</option>
                </select>
              </div>
              <div className="recording-actions">
                <button
                  className="play-btn"
                  onClick={() => playRecording(currentRecording)}
                >
                  ▶️ تشغيل
                </button>
                <button
                  className="save-btn"
                  onClick={saveCurrentRecording}
                >
                  💾 حفظ
                </button>
                <button
                  className="discard-btn"
                  onClick={() => setCurrentRecording(null)}
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recordings List */}
        <div className="recordings-list">
          <h4>📚 التسجيلات المحفوظة ({recordings.length})</h4>
          {recordings.length === 0 ? (
            <div className="no-recordings">
              <div className="no-recordings-icon">🎤</div>
              <p>لا توجد تسجيلات بعد</p>
              <small>ابدأ بتسجيل أول ملاحظة صوتية!</small>
            </div>
          ) : (
            <div className="recordings-grid">
              {recordings.map((recording) => (
                <div key={recording.id} className="recording-item">
                  <div className="recording-header">
                    <span className="recording-icon">
                      {getCategoryIcon(recording.category)}
                    </span>
                    <div className="recording-info">
                      <h5>{recording.title}</h5>
                      <small>{recording.timestamp.toLocaleString('ar-MA')}</small>
                    </div>
                  </div>
                  <div className="recording-meta">
                    <span className="duration">⏱️ {formatTime(recording.duration)}</span>
                    <span className="category">{recording.category}</span>
                  </div>
                  <div className="recording-actions">
                    <button
                      className={`play-btn ${playingId === recording.id ? 'playing' : ''}`}
                      onClick={() => playRecording(recording)}
                    >
                      {playingId === recording.id ? '⏸️' : '▶️'}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteRecording(recording.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
