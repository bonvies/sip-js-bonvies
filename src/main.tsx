// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './normalize.css';
import './index.css';

import App from "./App";

createRoot(document.getElementById('root')!).render(
  <App />,
)
