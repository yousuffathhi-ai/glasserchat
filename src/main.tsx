import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, ensureDynamicPwaIcon } from './utils/pwa';

// Initialize Progressive Web App Service Worker and dynamic icon registration
registerServiceWorker();
ensureDynamicPwaIcon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
