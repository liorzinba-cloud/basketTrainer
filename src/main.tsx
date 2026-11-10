import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BasketballPlaybook from './BasketballPlaybook';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BasketballPlaybook />
  </StrictMode>
);
