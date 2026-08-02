import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award, Sparkles, Volume2, VolumeX, Timer as TimerIcon, Music, Zap } from 'lucide-react';
import { useData } from '../../context/DataContext';
import API from '../../services/api';
import confetti from 'canvas-confetti';

export default function PomodoroTimer() {
  const { subjects = [], refreshAll } = useData();

  const [studyMinutes, setStudyMinutes]     = useState(25);
  const [breakMinutes, setBreakMinutes]     = useState(5);
  const [mode, setMode]                     = useState('study');
  const [timeLeft, setTimeLeft]             = useState(25 * 60);
  const [isActive, setIsActive]             = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [distractions, setDistractions]     = useState(0);
  const [focusScore, setFocusScore]         = useState(100);
  const [ambientSound, setAmbientSound]     = useState('none');
  const [volume, setVolume]                 = useState(0.5);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioCtxRef  = useRef(null);
  const soundNodeRef = useRef(null);
  const gainNodeRef  = useRef(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    setFocusScore(Math.max(20, 100 - distractions * 15));
  }, [distractions]);

  useEffect(() => () => stopAmbientSound(), []);

  useEffect(() => {
    if (isPlayingAudio) startAmbientSound();
    else stopAmbientSound();
  }, [ambientSound, isPlayingAudio]);

  useEffect(() => {
    if (gainNodeRef.current) gainNodeRef.current.gain.value = volume;
  }, [volume]);

  const startAmbientSound = () => {
    stopAmbientSound();
    if (ambientSound === 'none') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      if (ambientSound === 'white' || ambientSound === 'rain') {
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer; whiteNoise.loop = true;
        if (ambientSound === 'rain') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.value = 1000;
          whiteNoise.connect(filter); filter.connect(gain);
        } else { whiteNoise.connect(gain); }
        whiteNoise.start(); soundNodeRef.current = whiteNoise;
      } else if (ambientSound === 'binaural') {
        const oscL = ctx.createOscillator(); const oscR = ctx.createOscillator();
        oscL.frequency.value = 200; oscR.frequency.value = 210;
        oscL.connect(gain); oscR.connect(gain);
        oscL.start(); oscR.start(); soundNodeRef.current = oscL;
      } else if (ambientSound === 'forest') {
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i=0;i<bufferSize;i++){
          const w=Math.random()*2-1;
          b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
          b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
          b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
          output[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
        }
        const pinkNoise = ctx.createBufferSource();
        pinkNoise.buffer=noiseBuffer; pinkNoise.loop=true;
        pinkNoise.connect(gain); pinkNoise.start(); soundNodeRef.current=pinkNoise;
      }
    } catch(e) { console.warn('Audio error:', e); }
  };

  const stopAmbientSound = () => {
    if (soundNodeRef.current) { try { soundNodeRef.current.stop(); } catch(e){} soundNodeRef.current = null; }
    if (audioCtxRef.current)  { try { audioCtxRef.current.close();  } catch(e){} audioCtxRef.current  = null; }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((mode === 'study' ? studyMinutes : breakMinutes) * 60);
    setDistractions(0);
  };

  const handleSessionComplete = async () => {
    setIsActive(false); stopAmbientSound(); setIsPlayingAudio(false);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (mode === 'study') {
      try {
        const targetSubject = subjects.find(s => s._id === selectedSubject) || subjects[0];
        await API.post('/sessions', {
          subjectId: targetSubject?._id,
          subjectName: targetSubject?.name || 'General Focus',
          topicName: 'Focus Block Session',
          durationMinutes: studyMinutes, focusScore,
          distractionCount: distractions,
        });
        await refreshAll();
      } catch(err) { console.error('Session save error:', err); }
      setMode('break'); setTimeLeft(breakMinutes * 60);
    } else {
      setMode('study'); setTimeLeft(studyMinutes * 60);
    }
  };

  const formatTime = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const totalSecs = (mode === 'study' ? studyMinutes : breakMinutes) * 60;
  const progressPercent = ((totalSecs - timeLeft) / totalSecs) * 100;
  const r = 110;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;
  const isStudy = mode === 'study';
  const accentColor = isStudy ? '#7C3AED' : '#10B981';
  const glowClass  = isStudy ? 'timer-ring-glow' : 'timer-ring-glow-green';

  const sounds = [
    { id: 'none',     label: '🔇 Off' },
    { id: 'rain',     label: '🌧️ Rain' },
    { id: 'white',    label: '📻 White' },
    { id: 'binaural', label: '🧠 Focus' },
    { id: 'forest',   label: '🌲 Forest' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12 animate-fade-in-up">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white flex items-center justify-center gap-2.5">
          <TimerIcon className="w-6 h-6 text-violet-500" />
          Pomodoro Focus Session
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Boost focus, track sessions, and log study time directly into your XP progress.
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="rounded-3xl border overflow-hidden shadow-2xl
        bg-white dark:bg-[#0C1222]
        border-slate-200/60 dark:border-white/[0.07]">

        {/* Mode Toggle */}
        <div className="flex p-4 gap-2 border-b border-slate-100 dark:border-white/[0.06]">
          {[
            { id: 'study', label: `Study · ${studyMinutes}m`,  color: 'bg-violet-600 shadow-violet-500/30' },
            { id: 'break', label: `Break · ${breakMinutes}m`,  color: 'bg-emerald-500 shadow-emerald-500/30' },
          ].map(m => (
            <button key={m.id}
              onClick={() => { setMode(m.id); setTimeLeft((m.id==='study'?studyMinutes:breakMinutes)*60); setIsActive(false); }}
              className={`flex-1 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200
                ${mode === m.id ? `${m.color} text-white shadow-lg` : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="flex flex-col items-center py-10 gap-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
              {/* Track */}
              <circle cx="128" cy="128" r={r} fill="none"
                className="stroke-slate-100 dark:stroke-white/[0.07]" strokeWidth="14" />
              {/* Progress */}
              <circle cx="128" cy="128" r={r} fill="none"
                stroke={accentColor} strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ${glowClass}`}
              />
            </svg>

            {/* Center display */}
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black stat-number text-slate-900 dark:text-white tracking-tight leading-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-widest mt-2"
                style={{ color: accentColor }}>
                {isStudy ? '● Deep Work' : '● Relaxation'}
              </span>
              {isActive && (
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  In Progress
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={resetTimer}
              className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-slate-300
                hover:bg-slate-200 dark:hover:bg-white/[0.12] transition-all flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </button>

            <button onClick={toggleTimer}
              className={`px-10 py-4 rounded-2xl font-bold text-[15px] text-white shadow-xl transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 flex items-center gap-3`}
              style={{ backgroundColor: accentColor, boxShadow: `0 12px 28px -8px ${accentColor}60` }}>
              {isActive
                ? <><Pause className="w-5 h-5 fill-white" /> Pause</>
                : <><Play className="w-5 h-5 fill-white" /> Start Focus</>}
            </button>
          </div>

          {/* Duration Controls */}
          <div className="flex items-center gap-6 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Study:</span>
              <div className="flex items-center gap-1">
                {[15, 25, 45, 60].map(m => (
                  <button key={m} onClick={() => { setStudyMinutes(m); if(mode==='study') setTimeLeft(m*60); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${studyMinutes===m ? 'bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400' : 'hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Break:</span>
              <div className="flex items-center gap-1">
                {[5, 10, 15].map(m => (
                  <button key={m} onClick={() => { setBreakMinutes(m); if(mode==='break') setTimeLeft(m*60); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${breakMinutes===m ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Soundscape */}
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700 dark:text-slate-200">
              <Music className="w-4 h-4 text-violet-500" />
              Ambient Soundscape
            </div>
            <button onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all
                ${isPlayingAudio ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400'}`}>
              {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {isPlayingAudio ? 'On' : 'Off'}
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {sounds.map(s => (
              <button key={s.id}
                onClick={() => { setAmbientSound(s.id); setIsPlayingAudio(s.id !== 'none'); }}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center
                  ${ambientSound === s.id
                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                    : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center gap-3">
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-violet-600" />
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="p-4 text-center border-r border-slate-100 dark:border-white/[0.06]">
            <p className="text-[11px] text-slate-400 font-medium mb-1">Focus Score</p>
            <div className="flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xl font-black stat-number text-slate-900 dark:text-white">{focusScore}%</span>
            </div>
          </div>
          <div className="p-4 text-center">
            <p className="text-[11px] text-slate-400 font-medium mb-1">Distractions</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black stat-number text-rose-500">{distractions}</span>
              <button onClick={() => setDistractions(d => d + 1)}
                className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold text-[10px] rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors">
                +1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
