import React, { useState, useRef, useEffect } from 'react';
import { Frame, PlaybookDrill, PlayerSimulationState, BallSimulationState } from './types';
import { teamStorage, builtInDrills } from './drills';

// Deep copy so edits never modify the built-in drill definitions.
const cloneFrames = (frames: Frame[]): Frame[] => structuredClone(frames);

export default function BasketballPlaybook() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedDrill, setSelectedDrill] = useState<PlaybookDrill>(builtInDrills[0]);
  const [frames, setFrames] = useState<Frame[]>(() => cloneFrames(builtInDrills[0].frames));
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(0.02);
  const [savedJsonOutput, setSavedJsonOutput] = useState<string | null>(null);

  const isDraggingPlayer = useRef<string | null>(null);
  const isDraggingBall = useRef<boolean>(false);

  const currentPlayersRender = useRef<PlayerSimulationState[]>([]);
  const currentBallRender = useRef<BallSimulationState>({ x: 0, y: 0, attachedToPlayerId: null });

  const loadDrill = (drill: PlaybookDrill) => {
    if (isPlaying) return;
    setSelectedDrill(drill);
    setFrames(cloneFrames(drill.frames));
    setCurrentFrameIndex(0);
    setSavedJsonOutput(null);
  };

  useEffect(() => {
    if (!isPlaying && frames[currentFrameIndex]) {
      currentPlayersRender.current = JSON.parse(JSON.stringify(frames[currentFrameIndex].players));
      currentBallRender.current = JSON.parse(JSON.stringify(frames[currentFrameIndex].ball));
      drawCourt();
    }
  }, [frames, currentFrameIndex, isPlaying]);

  const drawCourt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fbe9d0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath(); ctx.arc(400, 470, 320, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.strokeRect(300, 320, 200, 150);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(370, 450); ctx.lineTo(430, 450); ctx.stroke();
    ctx.beginPath(); ctx.arc(400, 440, 12, 0, 2 * Math.PI); ctx.fillStyle = '#e67e22'; ctx.fill(); ctx.stroke();

    currentPlayersRender.current.forEach((pSim) => {
      const profile = teamStorage.find((t) => t.id === pSim.id);
      if (!profile) return;

      ctx.beginPath();
      ctx.arc(pSim.x, pSim.y, 18, 0, 2 * Math.PI);
      ctx.fillStyle = profile.team === 'offense' ? '#3498db' : '#e74c3c';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
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

    const prevFrame = frames[currentFrameIndex];
    let currentFrame: Frame;

    if (isDraggingPlayer.current) {
      const draggedId = isDraggingPlayer.current;
      currentFrame = {
        ...prevFrame,
        players: prevFrame.players.map((p) => p.id === draggedId ? { ...p, x, y } : p),
      };
    } else if (isDraggingBall.current) {
      const hoverPlayer = prevFrame.players.find((p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) <= 22);
      currentFrame = {
        ...prevFrame,
        ball: hoverPlayer
          ? { ...prevFrame.ball, attachedToPlayerId: hoverPlayer.id }
          : { x, y, attachedToPlayerId: null },
      };
    } else {
      return;
    }

    const updatedFrames = frames.map((f, i) => (i === currentFrameIndex ? currentFrame : f));
    setFrames(updatedFrames);
    currentPlayersRender.current = JSON.parse(JSON.stringify(currentFrame.players));
    currentBallRender.current = JSON.parse(JSON.stringify(currentFrame.ball));
    drawCourt();
  };

  const handleMouseUp = () => { isDraggingPlayer.current = null; isDraggingBall.current = false; };

  const handleSaveDrill = () => {
    const exportData = {
      drill_id: selectedDrill.id,
      name: selectedDrill.name,
      last_modified: new Date().toISOString(),
      frames: frames
    };
    setSavedJsonOutput(JSON.stringify(exportData, null, 2));
  };

  const playAnimation = () => {
    if (frames.length < 2) return;
    setIsPlaying(true);

    let frameIdx = 0;
    let progress = 0;

    const animate = () => {
      if (frameIdx >= frames.length - 1) {
        setIsPlaying(false);
        setCurrentFrameIndex(frames.length - 1);
        return;
      }

      const startF = frames[frameIdx];
      const endF = frames[frameIdx + 1];

      currentPlayersRender.current = startF.players.map((sP) => {
        const eP = endF.players.find((p) => p.id === sP.id);
        if (!eP) return sP;
        return { id: sP.id, x: sP.x + (eP.x - sP.x) * progress, y: sP.y + (eP.y - sP.y) * progress };
      });

      const getAbsoluteBallPos = (f: Frame) => {
        if (f.ball.attachedToPlayerId) {
          const p = f.players.find((pl) => pl.id === f.ball.attachedToPlayerId);
          return p ? { x: p.x + 16, y: p.y - 16 } : { x: f.ball.x, y: f.ball.y };
        }
        return { x: f.ball.x, y: f.ball.y };
      };

      const ballStart = getAbsoluteBallPos(startF);
      const ballEnd = getAbsoluteBallPos(endF);

      currentBallRender.current = {
        attachedToPlayerId: progress > 0.85 ? endF.ball.attachedToPlayerId : null,
        x: ballStart.x + (ballEnd.x - ballStart.x) * progress,
        y: ballStart.y + (ballEnd.y - ballStart.y) * progress,
      };

      drawCourt();

      progress += animationSpeed;
      if (progress >= 1) {
        progress = 0;
        frameIdx++;
        setCurrentFrameIndex(frameIdx);
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📖 תרגילי 5X5</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {builtInDrills.map((drill) => (
              <div
                key={drill.id}
                onClick={() => loadDrill(drill)}
                style={{
                  padding: '12px', borderRadius: '6px',
                  border: selectedDrill.id === drill.id ? '2px solid #e67e22' : '1px solid #ddd',
                  backgroundColor: selectedDrill.id === drill.id ? '#fff9f4' : '#fff',
                  cursor: isPlaying ? 'not-allowed' : 'pointer'
                }}
              >
                <strong style={{ fontSize: '13px' }}>{drill.name}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>⚡ בקרת מהירות</h4>
          <input 
            type="range" min="0.005" max="0.05" step="0.005"
            value={animationSpeed} 
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', flex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 5px 0' }}>{selectedDrill.name}</h2>
          <p style={{ margin: 0, color: '#555', fontSize: '13px' }}>{selectedDrill.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={playAnimation} disabled={isPlaying} style={{ padding: '10px 25px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isPlaying ? '⚡ רץ...' : '▶️ הפעל מהלך'}
          </button>
          <button onClick={handleSaveDrill} disabled={isPlaying} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            💾 שמור וייצא תרגיל
          </button>
        </div>

        <canvas
          ref={canvasRef} width={800} height={500}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          style={{ border: '3px solid #2c3e50', borderRadius: '8px', background: '#fbe9d0' }}
        />

        {savedJsonOutput && (
          <div style={{ width: '800px', background: '#2c3e50', color: '#2ecc71', padding: '15px', borderRadius: '6px', textAlign: 'left', direction: 'ltr' }}>
            <pre style={{ margin: 0, fontSize: '11px', overflowX: 'auto', maxHeight: '200px' }}>{savedJsonOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
