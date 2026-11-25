import { useCallback, useEffect, useRef, useState } from 'react';
import HomeView from './components/HomeView.jsx';
import KirishView from './components/KirishView.jsx';
import DarslikView from './components/DarslikView.jsx';
import { getStoredLead, saveLead } from './utils/lead.js';

const VIEWS = ['home', 'kirish', 'darslik'];

function resolveView(name, hasLead) {
  let target = VIEWS.includes(name) ? name : 'home';
  if (target === 'darslik' && !hasLead) target = 'kirish';
  return target;
}

export default function App() {
  const [lead, setLead] = useState(() => getStoredLead());
  const [current, setCurrent] = useState(() =>
    resolveView(window.location.hash.slice(1), Boolean(getStoredLead()))
  );
  const [enteredView, setEnteredView] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  const leadRef = useRef(lead);
  leadRef.current = lead;
  const currentRef = useRef(current);
  currentRef.current = current;

  const show = useCallback((name) => {
    const target = resolveView(name, Boolean(leadRef.current));
    if (target === currentRef.current) return;
    currentRef.current = target;
    setCurrent(target);
    setEnteredView(target);
    window.scrollTo(0, 0);
  }, []);

  const go = useCallback(
    (name, replace = false) => {
      const url = name ? '#' + name : window.location.pathname + window.location.search;
      try {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
      } catch {
        /* previews */
      }
      show(name);
    },
    [show]
  );

  useEffect(() => {
    const onPopState = () => show(window.location.hash.slice(1));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [show]);

  const handleOpen = useCallback(() => {
    go(leadRef.current ? 'darslik' : 'kirish');
  }, [go]);

  const handleFormSuccess = useCallback(
    (value) => {
      saveLead(value);
      leadRef.current = value;
      setLead(value);
      if (currentRef.current === 'kirish') {
        setUnlocking(true);
        go('darslik', true);
      }
    },
    [go]
  );

  const handleUnlockDone = useCallback(() => {
    setUnlocking(false);
  }, []);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="i-left" viewBox="0 0 24 24">
          <path d="M15 5l-7 7 7 7" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
        </symbol>
      </svg>

      <HomeView
        isActive={current === 'home'}
        isEntered={enteredView === 'home'}
        onOpen={handleOpen}
      />

      <KirishView
        isActive={current === 'kirish'}
        isEntered={enteredView === 'kirish'}
        onGoHome={() => go('')}
        onSuccess={handleFormSuccess}
      />

      <DarslikView
        isActive={current === 'darslik'}
        isEntered={enteredView === 'darslik'}
        lead={lead}
        unlocking={unlocking}
        onUnlockDone={handleUnlockDone}
        onGoHome={() => go('')}
        onGoKirish={() => go('kirish')}
      />
    </>
  );
}
