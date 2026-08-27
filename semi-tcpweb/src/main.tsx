import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../node_modules/@douyinfe/semi-ui/dist/css/semi.min.css';
import './styles/global.css';

try {
  if (localStorage.getItem('theme-mode') === 'dark') {
    document.body.setAttribute('theme-mode', 'dark');
  }
} catch {
  // Storage may be unavailable in hardened/private browser contexts.
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
