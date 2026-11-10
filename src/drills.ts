import { TeamPlayerProfile, PlaybookDrill } from './types';

export const teamStorage: TeamPlayerProfile[] = [
  // Offense (5 Players)
  { id: 'O1', name: 'אלון', position: 'PG', height: '1.88', team: 'offense' },
  { id: 'O2', name: 'עידן', position: 'SG', height: '1.95', team: 'offense' },
  { id: 'O3', name: 'גל', position: 'SF', height: '2.01', team: 'offense' },
  { id: 'O4', name: 'רוני', position: 'PF', height: '2.06', team: 'offense' },
  { id: 'O5', name: 'קייל', position: 'C', height: '2.11', team: 'offense' },
  
  // Defense (5 Players)
  { id: 'X1', name: 'שומר 1', position: 'Def1', height: '1.90', team: 'defense' },
  { id: 'X2', name: 'שומר 2', position: 'Def2', height: '1.96', team: 'defense' },
  { id: 'X3', name: 'שומר 3', position: 'Def3', height: '2.00', team: 'defense' },
  { id: 'X4', name: 'שומר 4', position: 'Def4', height: '2.05', team: 'defense' },
  { id: 'X5', name: 'שומר 5', position: 'Def5', height: '2.10', team: 'defense' },
];

export const builtInDrills: PlaybookDrill[] = [
  {
    id: 'horns_set',
    name: 'תרגיל קרניים מלא (5x5 Horns Set)',
    description: 'רכז הקבוצה (PG) מנהל את המשחק מלמעלה. שני הגבוהים (PF, C) עולים לעמדות המרפק (Horns) לחסימה כפולה. שני הגארדים (SG, SF) מחכים בפינות לרווח את המגרש.',
    frames: [
      {
        players: [
          { id: 'O1', x: 400, y: 100 }, // PG
          { id: 'O2', x: 120, y: 380 }, // SG (Corner)
          { id: 'O3', x: 680, y: 380 }, // SF (Corner)
          { id: 'O4', x: 340, y: 220 }, // PF (High Elbow)
          { id: 'O5', x: 460, y: 220 }, // C (High Elbow)
          
          { id: 'X1', x: 400, y: 140 }, // Matchups
          { id: 'X2', x: 150, y: 360 },
          { id: 'X3', x: 650, y: 360 },
          { id: 'X4', x: 340, y: 250 },
          { id: 'X5', x: 460, y: 250 },
        ],
        ball: { x: 400, y: 100, attachedToPlayerId: 'O1' }
      },
      {
        players: [
          { id: 'O1', x: 480, y: 130 }, // PG sweeps right off C's screen
          { id: 'O2', x: 120, y: 380 },
          { id: 'O3', x: 680, y: 380 },
          { id: 'O4', x: 340, y: 220 },
          { id: 'O5', x: 460, y: 220 }, // Setting screen
          
          { id: 'X1', x: 450, y: 145 }, // Trailing PG
          { id: 'X2', x: 150, y: 360 },
          { id: 'X3', x: 650, y: 360 },
          { id: 'X4', x: 340, y: 250 },
          { id: 'X5', x: 480, y: 200 }, // Stepping out to contain
        ],
        ball: { x: 480, y: 130, attachedToPlayerId: 'O1' }
      },
      {
        players: [
          { id: 'O1', x: 520, y: 200 }, 
          { id: 'O2', x: 120, y: 380 },
          { id: 'O3', x: 680, y: 350 }, // SF lifting up
          { id: 'O4', x: 320, y: 320 }, // PF diving back to rim
          { id: 'O5', x: 430, y: 380 }, // C rolling down hard
          
          { id: 'X1', x: 500, y: 190 },
          { id: 'X2', x: 150, y: 360 },
          { id: 'X3', x: 660, y: 360 },
          { id: 'X4', x: 350, y: 300 },
          { id: 'X5', x: 480, y: 320 }, // Sucked into paint
        ],
        ball: { x: 430, y: 380, attachedToPlayerId: 'O5' } // Pocket pass to C rolling!
      }
    ]
  },
  {
    id: 'five_out_motion',
    name: 'תנועה בחמישה בחוץ (5-Out Motion Cut)',
    description: 'מערך פתוח לחלוטין ללא שחקנים בצבע. כל חמשת השחקנים מרווחים מחוץ לקשת השלוש. הרכז מוסר לצד, ומבצע חיתוך מהיר (Give & Go) ישירות לעבר הסל.',
    frames: [
      {
        players: [
          { id: 'O1', x: 400, y: 90 },  // Top
          { id: 'O2', x: 230, y: 150 }, // Wing L
          { id: 'O3', x: 570, y: 150 }, // Wing R
          { id: 'O4', x: 140, y: 280 }, // Corner L
          { id: 'O5', x: 660, y: 280 }, // Corner R
          
          { id: 'X1', x: 400, y: 125 },
          { id: 'X2', x: 250, y: 175 },
          { id: 'X3', x: 550, y: 175 },
          { id: 'X4', x: 170, y: 290 },
          { id: 'X5', x: 630, y: 290 },
        ],
        ball: { x: 400, y: 90, attachedToPlayerId: 'O1' }
      },
      {
        players: [
          { id: 'O1', x: 400, y: 95 },  
          { id: 'O2', x: 230, y: 150 }, 
          { id: 'O3', x: 570, y: 150 }, // Receives ball
          { id: 'O4', x: 140, y: 280 }, 
          { id: 'O5', x: 660, y: 280 }, 
          
          { id: 'X1', x: 410, y: 125 },
          { id: 'X2', x: 250, y: 175 },
          { id: 'X3', x: 560, y: 170 }, // Pressuring ball
          { id: 'X4', x: 170, y: 290 },
          { id: 'X5', x: 630, y: 290 },
        ],
        ball: { x: 570, y: 150, attachedToPlayerId: 'O3' } // Ball passed to Wing R
      },
      {
        players: [
          { id: 'O1', x: 400, y: 350 }, // PG cuts straight through the open lane
          { id: 'O2', x: 230, y: 150 }, 
          { id: 'O3', x: 570, y: 150 }, 
          { id: 'O4', x: 140, y: 280 }, 
          { id: 'O5', x: 660, y: 280 }, 
          
          { id: 'X1', x: 410, y: 250 }, // Defeated by speed of cut
          { id: 'X2', x: 250, y: 175 },
          { id: 'X3', x: 560, y: 170 }, 
          { id: 'X4', x: 220, y: 300 }, // Weakside help tries to rotate
          { id: 'X5', x: 630, y: 290 },
        ],
        ball: { x: 400, y: 350, attachedToPlayerId: 'O1' } // Perfect pass back to the cutter!
      }
    ]
  }
];
