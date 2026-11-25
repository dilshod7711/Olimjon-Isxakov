import { useEffect, useRef, useState } from 'react';
import { CONFIG, formatPhone } from '../utils/lead.js';

const clamp = (n) => Math.max(0, Math.min(1, n));

export default function DarslikView({
  isActive,
  isEntered,
  lead,
  unlocking,
  onUnlockDone,
  onGoHome,
  onGoKirish,
}) {
  const tlRef = useRef(null);
  const [showLock, setShowLock] = useState(false);

  // Lock animation right after form submission
  useEffect(() => {
    const motion = document.documentElement.classList.contains('motion');
    if (isActive && unlocking && motion) {
      setShowLock(true);
      const timer = setTimeout(() => {
        setShowLock(false);
        onUnlockDone();
      }, 2100);
      return () => clearTimeout(timer);
    } else if (!isActive) {
      setShowLock(false);
    }
  }, [isActive, unlocking, onUnlockDone]);

  // Timelines: the line follows the scroll
  useEffect(() => {
    const motion = document.documentElement.classList.contains('motion');
    if (!motion) return;

    const progress = () => {
      const tl = tlRef.current;
      if (!tl) return;
      const box = tl.getBoundingClientRect();
      if (!box.height) return;
      const vh = window.innerHeight;
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      const items = [...tl.children];
      const across = items.length > 1 && items[0].offsetTop === items[1].offsetTop;
      const row = clamp((vh * 0.82 - box.top) / (vh * 0.45)) * items.length;
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const raw = across ? row - i : (vh * 0.74 - r.top) / r.height;
        const p = atEnd ? 1 : clamp(raw);
        li.style.setProperty('--p', p.toFixed(3));
        li.classList.toggle('lit', p > 0);
      });
    };

    const events = ['scroll', 'resize', 'load'];
    events.forEach((type) => window.addEventListener(type, progress, { passive: true }));
    progress();
    return () => {
      events.forEach((type) => window.removeEventListener(type, progress));
    };
  }, [isActive]);

  const initials = lead
    ? lead.name
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';
  const formattedPhone = lead ? '+998 ' + formatPhone(lead.phone.slice(4)) : '';
  const isHttp = typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol);

  return (
    <div
      className={isActive && isEntered ? 'view enter' : 'view'}
      id="darslik"
      hidden={!isActive}
    >
      <div className="nav">
        <div className="wrap">
          <button className="back" type="button" onClick={onGoHome}>
            <svg className="i">
              <use href="#i-left" />
            </svg>
            Bosh sahifa
          </button>
        </div>
      </div>
      <main className="page lesson">
        <div className="me">
          <span className="initials" id="meInitials" aria-hidden="true">
            {initials}
          </span>
          <div>
            <b id="meName">{lead ? lead.name : ''}</b>
            <span id="mePhone">{formattedPhone}</span>
          </div>
          <button className="edit" type="button" onClick={onGoKirish}>
            O‘zgartirish
          </button>
        </div>
        <h1>Darsligingiz tayyor</h1>
        <div className="player" id="player">
          {isActive &&
            (!CONFIG.videoId ? (
              <p className="wait">[YouTube darslik havolasi qo‘yiladi]</p>
            ) : !isHttp ? (
              <a
                className="wait"
                href={`https://www.youtube.com/watch?v=${CONFIG.videoId}`}
                target="_blank"
                rel="noopener"
              >
                Darslikni YouTube’da ochish
              </a>
            ) : (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${CONFIG.videoId}?rel=0&playsinline=1`}
                title="Olimjon Isxakov darsligi"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ))}
          {showLock && (
            <div className="lock" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path className="shackle" d="M8 11V7.5a4 4 0 0 1 8 0V11" />
                <rect className="body" x="5" y="11" width="14" height="10" rx="2.5" />
                <path className="hole" d="M12 15v2" />
              </svg>
            </div>
          )}
        </div>
        <a
          className="btn yt"
          id="ytBtn"
          target="_blank"
          rel="noopener"
          href={CONFIG.videoId ? `https://www.youtube.com/watch?v=${CONFIG.videoId}` : undefined}
          hidden={!CONFIG.videoId}
        >
          <svg viewBox="0 0 28 20" aria-hidden="true">
            <rect width="28" height="20" rx="5.5" fill="#fff" />
            <path d="M11.2 5.7v8.6l7.4-4.3z" fill="#D90000" />
          </svg>
          YouTube orqali ko‘rish
        </a>
        <h2>Ko‘rishdan oldin tayyorlab qo‘ying</h2>
        <ol className="tl steps" ref={tlRef}>
          <li>
            <span>Qog‘oz va ruchka: dars boshida birga hisob qilasiz.</span>
          </li>
          <li>
            <span>O‘tgan yili nechta xodim ketganini eslang.</span>
          </li>
          <li>
            <span>Hozir ochiq turgan bitta vakansiyangizni tanlang.</span>
          </li>
        </ol>
      </main>
    </div>
  );
}
