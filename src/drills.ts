import { TeamPlayerProfile, PlaybookDrill, Frame, BallSimulationState } from './types';

export const teamStorage: TeamPlayerProfile[] = [
  { id: 'O1', name: 'אלון (רכז)', position: 'PG', height: '1.88', team: 'offense' },
  { id: 'O2', name: 'עידן (קלעי)', position: 'SG', height: '1.95', team: 'offense' },
  { id: 'O3', name: 'קייל (סנטר)', position: 'C', height: '2.11', team: 'offense' },
  { id: 'O4', name: 'בר (סמול)', position: 'SF', height: '2.01', team: 'offense' },
  { id: 'O5', name: 'דניאל (פאוור)', position: 'PF', height: '2.06', team: 'offense' },
  { id: 'X1', name: 'שומר רכז', position: 'Def', height: '1.90', team: 'defense' },
  { id: 'X2', name: 'שומר סנטר', position: 'Def', height: '2.08', team: 'defense' },
  { id: 'X3', name: 'שומר קלעי', position: 'Def', height: '1.94', team: 'defense' },
  { id: 'X4', name: 'שומר סמול', position: 'Def', height: '1.98', team: 'defense' },
  { id: 'X5', name: 'שומר פאוור', position: 'Def', height: '2.04', team: 'defense' },
];

export const builtInDrills: PlaybookDrill = {
  id: 'horns_set_5x5',
  name: 'תרגיל קרניים מלא (5x5 Horns Set)',
  description: 'מערך קרניים קלאסי של 5 על 5. שני הגבוהים (C ו-PF) עולים לקו השלוש לבצע חסימה מדורגת לרכז, בזמן שהקלעים מרווחים את המגרש מהפינות.',
  frames: [
    {
      players: [
        { id: 'O1', x: 400, y: 80 },
        { id: 'O2', x: 150, y: 350 },
        { id: 'O3', x: 340, y: 150 },
        { id: 'O4', x: 650, y: 350 },
        { id: 'O5', x: 460, y: 150 },
        { id: 'X1', x: 400, y: 115 },
        { id: 'X2', x: 340, y: 180 },
        { id: 'X3', x: 180, y: 330 },
        { id: 'X4', x: 620, y: 330 },
        { id: 'X5', x: 460, y: 180 },
      ],
      ball: { x: 400, y: 80, attachedToPlayerId: 'O1' }
    }
  ]
};

// Helper: build a frame from { playerId: [x, y] }.
const frame = (positions: Record<string, [number, number]>, ball: BallSimulationState): Frame => ({
  players: Object.entries(positions).map(([id, [x, y]]) => ({ id, x, y })),
  ball,
});

const BASKET = { x: 400, y: 440 };

export const pickAndRollDrill: PlaybookDrill = {
  id: 'high_pick_and_roll',
  name: 'פיק אנד רול גבוה (High Pick & Roll)',
  description: 'הסנטר עולה לחסום לרכז בראש הקשת. הרכז חודר שמאלה מעל החסימה, הסנטר מתגלגל לסל, מקבל מסירה ומסיים בלייאפ. הקלעים מרווחים בפינות.',
  frames: [
    frame({
      O1: [400, 90], O2: [120, 430], O3: [330, 300], O4: [680, 430], O5: [640, 230],
      X1: [400, 125], X2: [340, 330], X3: [150, 410], X4: [650, 410], X5: [610, 250],
    }, { x: 0, y: 0, attachedToPlayerId: 'O1' }),
    // C comes up and sets the screen on the PG's defender
    frame({
      O1: [400, 90], O2: [120, 430], O3: [365, 125], O4: [680, 430], O5: [640, 230],
      X1: [400, 125], X2: [355, 165], X3: [150, 410], X4: [650, 410], X5: [610, 250],
    }, { x: 0, y: 0, attachedToPlayerId: 'O1' }),
    // PG drives left off the screen, C rolls to the basket
    frame({
      O1: [290, 210], O2: [120, 430], O3: [385, 290], O4: [680, 430], O5: [640, 230],
      X1: [385, 145], X2: [310, 240], X3: [160, 400], X4: [640, 400], X5: [590, 270],
    }, { x: 0, y: 0, attachedToPlayerId: 'O1' }),
    // PG passes to the rolling C
    frame({
      O1: [280, 230], O2: [120, 430], O3: [400, 375], O4: [680, 430], O5: [640, 230],
      X1: [330, 200], X2: [300, 260], X3: [160, 400], X4: [640, 400], X5: [560, 300],
    }, { x: 0, y: 0, attachedToPlayerId: 'O3' }),
    // C finishes at the rim
    frame({
      O1: [280, 230], O2: [120, 430], O3: [400, 410], O4: [680, 430], O5: [640, 230],
      X1: [330, 200], X2: [330, 300], X3: [160, 400], X4: [640, 400], X5: [480, 370],
    }, { ...BASKET, attachedToPlayerId: null }),
  ],
};

export const floppyDrill: PlaybookDrill = {
  id: 'floppy_shooter',
  name: 'פלופי לקלעי (Floppy Action)',
  description: 'הקלעי מתחיל מתחת לסל, ושני הגבוהים חוסמים לו בשני הבלוקים. הקלעי בוחר צד, יוצא מעל החסימה של הפאוור לכנף ימין, מקבל מסירה מהרכז וזורק לשלוש.',
  frames: [
    frame({
      O1: [400, 90], O2: [400, 405], O3: [320, 385], O4: [140, 230], O5: [480, 385],
      X1: [400, 125], X2: [335, 360], X3: [400, 375], X4: [170, 250], X5: [465, 360],
    }, { x: 0, y: 0, attachedToPlayerId: 'O1' }),
    // SG curls off the PF's screen, defender gets caught on it
    frame({
      O1: [400, 90], O2: [560, 330], O3: [320, 385], O4: [140, 230], O5: [490, 380],
      X1: [400, 125], X2: [335, 360], X3: [470, 395], X4: [170, 250], X5: [470, 355],
    }, { x: 0, y: 0, attachedToPlayerId: 'O1' }),
    // SG pops out to the right wing behind the three-point line
    frame({
      O1: [400, 90], O2: [650, 250], O3: [320, 385], O4: [140, 230], O5: [490, 380],
      X1: [400, 125], X2: [335, 360], X3: [540, 340], X4: [170, 250], X5: [470, 355],
    }, { x: 0, y: 0, attachedToPlayerId: 'O1' }),
    // PG passes to SG on the wing
    frame({
      O1: [410, 95], O2: [650, 250], O3: [320, 385], O4: [140, 230], O5: [490, 380],
      X1: [420, 135], X2: [335, 360], X3: [590, 290], X4: [170, 250], X5: [470, 355],
    }, { x: 0, y: 0, attachedToPlayerId: 'O2' }),
    // SG shoots the three
    frame({
      O1: [410, 95], O2: [650, 250], O3: [340, 400], O4: [140, 230], O5: [470, 400],
      X1: [420, 135], X2: [345, 380], X3: [615, 270], X4: [170, 250], X5: [460, 375],
    }, { ...BASKET, attachedToPlayerId: null }),
  ],
};

export const playbookDrills: PlaybookDrill[] = [builtInDrills, pickAndRollDrill, floppyDrill];
