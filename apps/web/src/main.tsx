import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@reyogo/ui/src/globals.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
