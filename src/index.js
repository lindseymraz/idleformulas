import './WarningHider'
import 'hacktimer'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { notify } from './utilities';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

//Service Worker Registration for Progressive Web App features (offline caching, installing as web-app)
serviceWorkerRegistration.register({
    onUpdate: (registration)=>{
        notify.warning("Update available", "Refresh page to apply update",true)
        registration.waiting.postMessage({type: 'SKIP_WAITING'})
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); //Prevents user being asked to install web-app immediately on mobile
  window.installPromptPWAevent = e; //Saving event to trigger install popup later
});