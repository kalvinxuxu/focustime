import { useState, useEffect, useRef } from "react";

const HABITS = [
  { id: 1, label: "规划最重要的 3 件事", icon: "✦", points: 10 },
  { id: 2, label: "前 30 分钟不看手机", icon: "◈", points: 15 },
  { id: 3, label: "专注工作块（25 分钟）", icon: "▲", points: 20 },
  { id: 4, label: "真正休息一下", icon: "◎", points: 10 },
  { id: 5, label: "不 multitasking", icon: "⬡", points: 15 },
  { id: 6, label: "开始前清理干扰", icon: "◇", points: 10 },
  { id: 7, label: "每日复盘", icon: "◉", points: 20 },
];

const FOCUS_TIPS = [
  "从你最想逃避的任务开始。",
  "2 分钟法则：如果少于 2 分钟，现在就做。",
  "关闭所有你现在不需要的标签页。",
  "告诉自己：就 5 分钟。仅此而已。",
  "不完美的行动 > 完美的空想。",
  "要进步，不要完美。",
];

function getRing(pct) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  return circ - (pct / 100) * circ;
}

export default function App() {
  const days = ["一", "二", "三", "四", "五", "六", "日"];
  const todayIdx = new Date().getDay();

  const [checked, setChecked] = useState({});
  const [streak, setStreak] = useState(3);
  const [tip, setTip] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [pulseKey, setPulseKey] = useState(0);
  const intervalRef = useRef(null);

  const totalPts = HABITS.reduce((s, h) => s + (checked[h.id] ? h.points : 0), 0);
  const maxPts = HABITS.reduce((s, h) => s + h.points, 0);
  const pct = Math.round((totalPts / maxPts) * 100);

  useEffect(() => {
    if (timerOn) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { clearInterval(intervalRef.current); setTimerOn(false); return 25 * 60; }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [timerOn]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggle = (id) => {
    setPulseKey((k) => k + 1);
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  };

  const circ = 2 * Math.PI * 54;

  return (
    <div style={{
      fontFamily: "'DM Mono', monospace",
      background: "linear-gradient(135deg, #f8f9fa 0%, #e8ecf1 50%, #f0f4f8 100%)",
      minHeight: "100vh",
      color: "#1a1a2e",
      padding: "0 0 60px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@700;900&family=Cormorant+Garamond:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f9fa; }
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
        }
        .habit-row { display: flex; align-items: center; gap: 17px; padding: 19px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .habit-row:hover { background: rgba(108, 92, 231, 0.04); transform: translateX(4px); }
        .habit-row:last-child { border-bottom: none; }
        .habit-row.done { opacity: 0.6; }
        .check-box { width: 29px; height: 29px; border: 2px solid #d1d5db; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .check-box.active { background: linear-gradient(135deg, #6c5ce7 0%, #a88beb 100%); border-color: #6c5ce7; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.35); }
        .check-box.active span { font-size: 17px; }
        .day-dot { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .timer-btn { background: linear-gradient(135deg, #6c5ce7 0%, #a88beb 100%); border: none; color: white; font-family: inherit; font-size: 14px; padding: 12px 29px; border-radius: 10px; cursor: pointer; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.3s; font-weight: 500; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3); }
        .timer-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4); }
        .timer-btn.secondary { background: white; color: #6c5ce7; box-shadow: 0 2px 8px rgba(0,0,0,0.08); font-size: 14px; }
        .timer-btn.secondary:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .tip-btn { background: none; border: none; color: #888; font-family: inherit; font-size: 13px; cursor: pointer; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s; }
        .tip-btn:hover { color: #6c5ce7; }
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
        .pop { animation: pop 0.3s ease; }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(108,92,231,0.3)} 50%{box-shadow:0 0 30px rgba(108,92,231,0.5)} }
        .glowing { animation: glow 2s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .floating { animation: float 3s ease-in-out infinite; }
        .progress-ring { transform: rotate(-90deg); }
        .section-title { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #888; font-weight: 500; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "36px 32px 28px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative gradient orbs */}
        <div style={{
          position: "absolute", top: -50, right: -50, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: 30, left: 100, width: 150, height: 150,
          background: "radial-gradient(circle, rgba(168,139,235,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />

        <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#888", textTransform: "uppercase", marginBottom: 8, position: "relative" }}>
          专注力 · 反拖延
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Noto Serif SC', serif",
          fontSize: 50,
          fontWeight: 700,
          lineHeight: 1.1,
          color: "#1a1a2e",
          position: "relative"
        }}>
          每日<span style={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a88beb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>专注力</span>
        </div>

        {/* Week row */}
        <div style={{ display: "flex", gap: 10, marginTop: 24, position: "relative" }}>
          {days.map((d, i) => (
            <div key={i} className="day-dot" style={{
              background: i === todayIdx
                ? "linear-gradient(135deg, #6c5ce7 0%, #a88beb 100%)"
                : i < todayIdx
                  ? "rgba(108, 92, 231, 0.15)"
                  : "rgba(0,0,0,0.05)",
              color: i === todayIdx ? "#fff" : i < todayIdx ? "#6c5ce7" : "#aaa",
              boxShadow: i === todayIdx ? "0 4px 12px rgba(108,92,231,0.3)" : "none"
            }}>{d}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 32px" }}>

        {/* Progress ring + streak */}
        <div className="glass-card" style={{
          display: "flex", alignItems: "center", gap: 32, padding: "32px",
          borderRadius: 20, marginTop: 24
        }}>
          <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
            <svg width="140" height="140" className="progress-ring">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6c5ce7" />
                  <stop offset="100%" stopColor="#a88beb" />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r="54" fill="none" stroke="#e8ecef" strokeWidth="8" strokeLinecap="round" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="url(#gradient)" strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={getRing(pct)}
                style={{ transition: "stroke-dashoffset 0.5s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div key={pulseKey} style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 38,
                fontWeight: 700,
                background: "linear-gradient(135deg, #6c5ce7 0%, #a88beb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }} className={pulseKey ? "pop" : ""}>{pct}%</div>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>完成度</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>今日得分</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 58,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1a1a2e 0%, #4a4a6a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {totalPts}<span style={{ fontSize: 24, color: "#aaa" }}>/{maxPts}</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              padding: "12px 16px",
              background: "linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,158,107,0.08) 100%)",
              borderRadius: 12
            }}>
              <div style={{ fontSize: 24 }}>🔥</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#ff6b6b" }}>{streak} 天</div>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase" }}>连续打卡</div>
              </div>
            </div>
          </div>
        </div>

        {/* Habit list */}
        <div className="glass-card" style={{
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 24
        }}>
          <div style={{
            padding: "16px 24px",
            background: "linear-gradient(135deg, rgba(108,92,231,0.05) 0%, rgba(168,139,235,0.05) 100%)",
            borderBottom: "1px solid rgba(0,0,0,0.06)"
          }}>
            <span className="section-title">今日习惯</span>
          </div>
          {HABITS.map((h) => (
            <div key={h.id} className={`habit-row${checked[h.id] ? " done" : ""}`} onClick={() => toggle(h.id)}>
              <div className={`check-box${checked[h.id] ? " active" : ""}`}>
                {checked[h.id] && <span className="pop" style={{ color: "white", fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 22, opacity: 0.6 }}>{h.icon}</span>
              <span style={{ flex: 1, fontSize: 17, color: checked[h.id] ? "#888" : "#1a1a2e" }}>{h.label}</span>
              <span style={{
                fontSize: 13,
                color: checked[h.id] ? "#6c5ce7" : "#aaa",
                fontWeight: checked[h.id] ? 600 : 400,
                background: checked[h.id] ? "rgba(108,92,231,0.1)" : "rgba(0,0,0,0.03)",
                padding: "4px 10px",
                borderRadius: 12
              }}>+{h.points}分</span>
            </div>
          ))}
        </div>

        {/* Pomodoro timer */}
        <div className={`glass-card ${timerOn ? "glowing" : ""}`} style={{
          borderRadius: 20,
          padding: "28px",
          marginTop: 24,
          transition: "box-shadow 0.3s"
        }}>
          <div className="section-title" style={{ marginBottom: 16 }}>番茄专注 · 计时器</div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 77,
            fontWeight: 700,
            color: timerOn ? "#6c5ce7" : "#1a1a2e",
            letterSpacing: "0.05em",
            transition: "color 0.3s",
            marginBottom: 20,
            textAlign: "center"
          }}>
            {fmt(seconds)}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="timer-btn" onClick={() => setTimerOn((t) => !t)}>
              {timerOn ? "暂停" : "开始专注"}
            </button>
            <button className="timer-btn secondary" onClick={() => { setTimerOn(false); setSeconds(25 * 60); }}>重置</button>
          </div>
        </div>

        {/* Daily tip */}
        <div className="glass-card" style={{
          borderRadius: 20,
          padding: "24px 28px",
          marginTop: 24,
          background: "linear-gradient(135deg, rgba(108,92,231,0.06) 0%, rgba(168,139,235,0.06) 100%)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="section-title">专注提示</span>
            <button className="tip-btn" onClick={() => setTip((t) => (t + 1) % FOCUS_TIPS.length)}>下一条 →</button>
          </div>
          <div style={{
            fontSize: 19,
            lineHeight: 1.7,
            color: "#1a1a2e",
            fontStyle: "italic",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22
          }}>"{FOCUS_TIPS[tip]}"</div>
        </div>

      </div>
    </div>
  );
}
