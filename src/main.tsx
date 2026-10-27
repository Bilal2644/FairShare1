import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testFirebaseConnection } from './firebase.ts';

testFirebaseConnection().catch(console.warn);

createRoot(document.getElementById('root')!).render(<App />);
