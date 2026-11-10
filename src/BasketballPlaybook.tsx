import React, { useState, useRef, useEffect } from 'react';
import { TeamPlayerProfile, Frame, PlaybookDrill, PlayerSimulationState, BallSimulationState } from './types';
import { teamStorage as initialTeam, builtInDrills } from './drills';

export default function BasketballPlaybookUltimate() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [team, setTeam] = useState<TeamPlayerProfile[]>(initialTeam);
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState<'PG'|'SG'|'SF'|'PF'|'C'|'Def'>('PG');
  const [newPlayerHeight, setNewPlayerHeight] = useState('1.90');
  const [newPlayerTeam, setNewPlayerTeam] = useState<'offense'|'defense'>('offense');

  const [selectedDrill, setSelectedDrill] = useState<PlaybookDrill>(builtInDrills);
  const [frames, setFrames] = useState<Frame[]>(builtInDrills.frames);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(0.02);
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const isDraggingPlayer = useRef<string | null>(null);
  const isDraggingBall = useRef<boolean>(false);

  const currentPlayersRender = useRef<PlayerSimulationState[]>([]);
  const currentBallRender = useRef<BallSimulationState>({ x: 0, y: 0, attachedToPlayerId: null });

  useEffect(() => {
    if (!isPlaying && frames[currentFrameIndex]) {
      currentPlayersRender.current = JSON.parse(JSON.stringify(frames[currentFrameIndex].players));
      currentBallRender.current = JSON.parse(JSON.stringify(frames[currentFrameIndex].ball));
      drawCourt();
    }
  }, [frames, currentFrameIndex, isPlaying]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newId = `P_${Date.now()}`;
    const newProfile: TeamPlayerProfile = {
      id: newId,
      name: newPlayerName,
      position: newPlayerPos,
      height: newPlayerHeight,
      team: newPlayerTeam
    };

    setTeam(prev => [...prev, newProfile]);

    setFrames(prevFrames => prevFrames.map(frame => ({
      ...frame,
      players: [...frame.players, { id: newId, x: 400, y: 250 }]
    })));

    setNewPlayerName('');
  };

  const recordNextStep = (updatedPlayers: PlayerSimulationState[], updatedBall: BallSimulationState) => {
    if (!isRecording) return;
    
    setFrames(prev => {
      const nextFrame: Frame = {
        players: JSON.parse(JSON.stringify(updatedPlayers)),
        ball: JSON.parse(JSON.stringify(updatedBall))
      };
      const newFrames = [...prev, nextFrame];
      setCurrentFrameIndex(newFrames.length - 1);
      return newFrames;
    });
  };

  const handleSaveToServer = async () => {
    setServerStatus("🔄 שומר תרגיל בשרת...");
    
    const payload = {
      drill_name: selectedDrill.name,
      description: selectedDrill.description,
      recorded_at: new Date().toISOString(),
      total_frames: frames.length,
      frames: frames
    };

    try {
      const response = await fetch('https://your-backend-api.com/api/drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setServerStatus("✅ התרגיל נשמר בהצלחה בבסיס הנתונים!");
      } else {
        setServerStatus(`❌ שגיאת שרת: ${response.statusText} (הנתונים הודפסו לקונסול)`);
        console.log("Saved Payload:", payload);
      }
    } catch (error) {
      setServerStatus("⚠️ שרת לא זמין כרגע, קוד ה-JSON הודפס בהצלחה ל-Console של הדפדפן!");
      console.log("Basketball Drill JSON Payload:", payload);
    }
  };

  const handleStartNewRecording = () => {
    const freshFrame: Frame = {
      players: team.map((p, idx) => ({ id: p.id, x: 200 + (idx * 50), y: 150 + (p.team === 'defense' ? 100 : 0) })),
      ball: { x: 200, y: 150, attachedToPlayerId: team[0]?.id || null }
    };
    setFrames([freshFrame]);
    setCurrentFrameIndex(0);
    setIsRecording(true);
    setSelectedDrill({
      id: 'custom_recorded',
      name: 'תרגיל מוקלט חדש 🔴',
      description: 'תרגיל שנוצר והוקלט בזמן אמת על ידי המאמן בתנועת עכבר חופשית.',
      frames: [freshFrame]
    });
  };

  const drawCourt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fbe9d0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.arc(400, 470, 320, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.strokeRect(300, 320, 200, 150);
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(370, 450); ctx.lineTo(430, 450); ctx.stroke();
    ctx.beginPath(); ctx.arc(400, 440, 12, 0, 2 * Math.PI); ctx.fillStyle = '#e67e22'; ctx.fill(); ctx.stroke();

    currentPlayersRender.current.forEach((pSim) => {
      const profile = team.find((t) => t.id === pSim.id);
      if (!profile) return;

      ctx.beginPath(); ctx.arc(pSim.x, pSim.y, 18, 0, 2 * Math.PI);
      ctx.fillStyle = profile.team === 'offense' ? '#3498db' : '#e74c3c'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(profile.position, pSim.x, pSim.y);
    });

    const ball = currentBallRender.current;
    let ballX = ball.x; let ballY = ball.y;
    if (ball.attachedToPlayerId) {
      const player = currentPlayersRender.current.find((p) => p.id === ball.attachedToPlayerId);
      if (player) { ballX = player.x + 16; ballY = player.y - 16; }
    }
    ctx.beginPath(); ctx.arc(ballX, ballY, 8, 0, 2 * Math.PI); ctx.fillStyle = '#e67e22'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#000000'; ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ball = currentBallRender.current;
    let bX = ball.x; let bY = ball.y;
    if (ball.attachedToPlayerId) {
      const p = currentPlayersRender.current.find((pl) => pl.id === ball.attachedToPlayerId);
      if (p) { bX = p.x + 16; bY = p.y - 16; }
    }
    if (Math.sqrt((bX - x) ** 2 + (bY - y) ** 2) <= 15) {
      isDraggingBall.current = true;
      return;
    }

    const clickedPlayer = currentPlayersRender.current.find((p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) <= 18);
    if (clickedPlayer) isDraggingPlayer.current = clickedPlayer.id;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedFrames = [...frames];
    const currentFrame = updatedFrames[currentFrameIndex];

    if (isDraggingPlayer.current) {
      currentFrame.players = currentFrame.players.map((p) => p.id === isDraggingPlayer.current ? { ...p, x, y } : p);
    } else if (isDraggingBall.current) {
      const hoverPlayer = currentFrame.players.find((p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) <= 22);
      if (hoverPlayer) {
        currentFrame.ball.attachedToPlayerId = hoverPlayer.id;
      } else {
        currentFrame.ball.attachedToPlayerId = null;
        currentFrame.ball.x = x; currentFrame.ball.y = y;
      }
    } else {
      return;
    }

    setFrames(updatedFrames);
    currentPlayersRender.current = JSON.parse(JSON.stringify(currentFrame.players));
    currentBallRender.current = JSON.parse(JSON.stringify(currentFrame.ball));
    drawCourt();
  };

  const handleMouseUp = () => {
    if (isRecording && (isDraggingPlayer.current || isDraggingBall.current)) {
      recordNextStep(currentPlayersRender.current, currentBallRender.current);
    }
    isDraggingPlayer.current = null;
    isDraggingBall.current = false;
  };

  const playAnimation = () => {
    if (frames.length < 2) return;
    setIsPlaying(true);
    setIsRecording(false);

    let frameIdx = 0; let progress = 0;
    const animate = () => {
      if (frameIdx >= frames.length - 1) {
        setIsPlaying(false); setCurrentFrameIndex(frames.length - 1); return;
      }
      const startF = frames[frameIdx]; const endF = frames[frameIdx + 1];
      currentPlayersRender.current = startF.players.map((sP) => {
        const eP = endF.players.find((p) => p.id === sP.id);
        if (!eP) return sP;
        return { id: sP.id, x: sP.x + (eP.x - sP.x) * progress, y: sP.y + (eP.y - sP.y) * progress };
      });
      const getAbsoluteBallPos = (f: Frame) => {
        if (f.ball.attachedToPlayerId) {
          const p = f.players.find((pl) => pl.id === f.ball.attachedToPlayerId);
          return p ? { x: p.x + 16, y: p.y - 16 } : { x: f.ball.x, y: f.ball.y };
        } return { x: f.ball.x, y: f.ball.y };
      };
      const ballStart = getAbsoluteBallPos(startF); const ballEnd = getAbsoluteBallPos(endF);
      currentBallRender.current = {
        attachedToPlayerId: progress > 0.85 ? endF.ball.attachedToPlayerId : null,
        x: ballStart.x + (ballEnd.x - ballStart.x) * progress, y: ballStart.y + (ballEnd.y - ballStart.y) * progress,
      };
      drawCourt();
      progress += animationSpeed;
      if (progress >= 1) { progress = 0; frameIdx++; setCurrentFrameIndex(frameIdx); }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };
  function loadDrill(builtInDrills: PlaybookDrill): void {
      const drillFrames = builtInDrills.frames.map((frame) => ({
        players: frame.players.map((player) => ({ ...player })),
        ball: { ...frame.ball },
      }));
  
      setSelectedDrill(builtInDrills);
      setFrames(drillFrames);
      setCurrentFrameIndex(0);
      setIsRecording(false);
    }

  return (
    <div style={{ display: 'flex', gap: '25px', padding: '20px', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '15px' }}>🏃‍♂️ הוספת שחקן לסגל ולמגרש</h3>
          <form onSubmit={handleAddPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" placeholder="שם השחקן" value={newPlayerName} 
              onChange={e => setNewPlayerName(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <div style={{ display: 'flex', gap: '5px' }}>
              <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value as any)} style={{ flex: 1, padding: '5px' }}>
                <option value="PG">PG (רכז)</option> <option value="SG">SG (קלעי)</option>
                <option value="SF">SF (סמול)</option> <option value="PF">PF (פאוור)</option>
                <option value="C">C (סנטר)</option> <option value="Def">Def (הגנה)</option>
              </select>
              <input 
                type="text" placeholder="גובה" value={newPlayerHeight} onChange={e => setNewPlayerHeight(e.target.value)}
                style={{ width: '60px', padding: '5px', textAlign: 'center' }}
              />
            </div>
            <select value={newPlayerTeam} onChange={e => setNewPlayerTeam(e.target.value as any)} style={{ padding: '5px' }}>
              <option value="offense">קבוצת התקפה (כחול)</option>
              <option value="defense">קבוצת הגנה (אדום)</option>
            </select>
            <button type="submit" style={{ padding: '8px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              ＋ הוסף שחקן למגרש
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '15px' }}>📖 ספר תרגילים קבוצתי</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              disabled={isPlaying || isRecording}
              onClick={() => loadDrill(builtInDrills)}
              style={{
                padding: '10px', borderRadius: '6px', textAlign: 'right',
                border: selectedDrill.id === builtInDrills.id ? '2px solid #e67e22' : '1px solid #ddd',
                backgroundColor: selectedDrill.id === builtInDrills.id ? '#fff9f4' : '#fff',
                cursor: (isPlaying || isRecording) ? 'not-allowed' : 'pointer'
              }}
            >
              <strong style={{ fontSize: '13px' }}>{builtInDrills.name}</strong>
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '10px', background: '#fff', padding: '12px 20px', borderRadius: '8px', border: '1px solid #ddd', width: '800px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleStartNewRecording} disabled={isPlaying || isRecording}
              style={{ padding: '10px 18px', backgroundColor: isRecording ? '#bdc3c7' : '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isRecording ? '🔴 מקליט תנועה...' : '⏺️ התחל הקלטת תרגיל'}
            </button>

            {isRecording && (
              <button 
                onClick={() => setIsRecording(false)}
                style={{ padding: '10px 15px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                ⏹️ עצור הקלטה ({frames.length} שלבים)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={playAnimation} disabled={isPlaying || isRecording || frames.length < 2} style={{ padding: '10px 20px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              ▶️ נגן מהלך
            </button>
            
            <button onClick={handleSaveToServer} disabled={isPlaying} style={{ padding: '10px 20px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              💾 שמור וסנכרן לשרת
            </button>
          </div>
        </div>

        {serverStatus && (
          <div style={{ background: '#ebf5fb', color: '#2980b9', padding: '8px 20px', borderRadius: '5px', width: '760px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', border: '1px solid #d4e6f1' }}>
            {serverStatus}
          </div>
        )}

        <canvas
          ref={canvasRef} width={800} height={500}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          style={{ border: '3px solid #2c3e50', borderRadius: '8px', background: '#fbe9d0' }}
        />
      </div>
    </div>
  );
}
