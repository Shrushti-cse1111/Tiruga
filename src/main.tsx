import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker only in production builds
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    } catch (err) {
      console.warn('SW registration error:', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
