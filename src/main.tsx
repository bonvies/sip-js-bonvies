import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './normalize.css';
import './index.css';

import App from "./App";
import { SipCodeProvider } from './providers/SipCodeProvider';
createRoot(document.getElementById('root')!).render(
    <SipCodeProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </SipCodeProvider>,
)
