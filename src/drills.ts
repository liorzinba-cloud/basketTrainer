import { TeamPlayerProfile, PlaybookDrill } from './types';

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
