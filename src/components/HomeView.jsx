import { useEffect, useRef, useState } from 'react';
import portretImg from '../../rasm/portret.jpg';
import klinikaImg from '../../rasm/klinika.jpg';
import internationImg from '../../rasm/internation.jpg';

const NUMBER_RE = /\d+(?: \d{3})*(?:,\d+)?/g;
const clamp = (n) => Math.max(0, Math.min(1, n));

function countText(text, k) {
  return text.replace(NUMBER_RE, (n) => {
    const decimals = (n.split(',')[1] || '').length;
    const value = (parseFloat(n.replace(/ /g, '').replace(',', '.')) * k).toFixed(decimals);
    const [whole, rest] = value.split('.');
    return whole.replace(/\B(?=(\d{3})+$)/g, ' ') + (rest ? ',' + rest : '');
  });
}

function countUp(el, text) {
  const start = Date.now();
  const timer = setInterval(() => {
    const t = clamp((Date.now() - start) / 1800);
    el.textContent = t < 1 ? countText(text, 1 - Math.pow(1 - t, 3)) : text;
    if (t === 1) clearInterval(timer);
  }, 30);
  return timer;
}

export default function HomeView({ isActive, isEntered, onOpen }) {
  const rootRef = useRef(null);
  const heroBtnRef = useRef(null);
  const [barOff, setBarOff] = useState(true);

  // Sticky button hides only while the hero button is on screen
  useEffect(() => {
    const checkBar = () => {
      const btn = heroBtnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setBarOff(r.bottom > 0 && r.top < window.innerHeight);
    };
    const events = ['scroll', 'resize', 'load'];
    events.forEach((type) => window.addEventListener(type, checkBar, { passive: true }));
    checkBar();
    return () => {
      events.forEach((type) => window.removeEventListener(type, checkBar));
    };
  }, [isActive]);

  // Badges and folders play once when they come into view
  useEffect(() => {
    const motion = document.documentElement.classList.contains('motion');
    const root = rootRef.current;
    if (!motion || !root) return;

    let hidden = [...root.querySelectorAll('.reveal:not(.seen)')];
    const reveal = () => {
      hidden = hidden.filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || r.top > window.innerHeight * 0.8) return true;
        el.classList.add('seen');
        return false;
      });
    };
    const events = ['scroll', 'resize', 'load'];
    events.forEach((type) => window.addEventListener(type, reveal, { passive: true }));
    reveal();
    return () => {
      events.forEach((type) => window.removeEventListener(type, reveal));
    };
  }, [isActive]);

  // Numbers count up from zero the first time they are seen after each page load
  useEffect(() => {
    const motion = document.documentElement.classList.contains('motion');
    const root = rootRef.current;
    if (!motion || !root) return;

    const timers = [];
    let waiting = [...root.querySelectorAll('.nums dd')].map((el) => {
      const text = el.textContent;
      el.textContent = countText(text, 0);
      return { el, text };
    });

    const checkNumbers = () => {
      waiting = waiting.filter(({ el, text }) => {
        const r = el.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > window.innerHeight * 0.88) return true;
        timers.push(countUp(el, text));
        return false;
      });
    };

    const events = ['scroll', 'resize', 'load'];
    events.forEach((type) => window.addEventListener(type, checkNumbers, { passive: true }));
    checkNumbers();

    return () => {
      events.forEach((type) => window.removeEventListener(type, checkNumbers));
      timers.forEach((t) => clearInterval(t));
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={isActive && isEntered ? 'view enter' : 'view'}
      id="home"
      hidden={!isActive}
    >
      <header className="hero">
        <div className="hero-photo">
          <img src={portretImg} alt="Olimjon Isxakov" width="1024" height="944" />
        </div>
        <div className="wrap hero-text">
          <p className="name">
            Olimjon Isxakov<span>HR direktori</span>
          </p>
          <h1>
            Yaxshi xodim <em>nega ketib qoladi?</em>
          </h1>
          <p className="intro">
            Cleveland Clinic Abu Dhabi’da 5,5 yil ishlaganman. Inter Nation’da 250 dan ziyod xodim
            olganman.
          </p>
          <button
            ref={heroBtnRef}
            className="btn"
            type="button"
            id="heroBtn"
            onClick={onOpen}
          >
            <svg className="i">
              <use href="#i-play" />
            </svg>
            Darslikni ko‘rish
          </button>
          <p className="hero-meta">15 daqiqalik bepul YouTube darslik</p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <h2>
            Qayerda <em>ishlaganman?</em>
          </h2>
          <div className="companies">
            <article className="company">
              <img
                src={klinikaImg}
                alt="Cleveland Clinic Abu Dhabi binosi kechqurun"
                loading="lazy"
                width="1100"
                height="825"
              />
              <div className="company-t">
                <h3>Cleveland Clinic Abu Dhabi</h3>
                <p className="role">Onboarding bo‘limida ishlaganman</p>
                <p>Butun dunyodan mutaxassis yig‘adigan xalqaro klinika.</p>
                <dl className="nums">
                  <div>
                    <dt>mutaxassis haftasiga</dt>
                    <dd>40 ta</dd>
                  </div>
                  <div>
                    <dt>kadrlar qo‘nimsizligi</dt>
                    <dd>2-3%</dd>
                  </div>
                  <div>
                    <dt>tajribam</dt>
                    <dd>5,5 yil</dd>
                  </div>
                </dl>
              </div>
            </article>
            <article className="company">
              <img
                src={internationImg}
                alt="Olimjon Isxakov Inter Nation jamoasi va o‘quvchilari bilan"
                loading="lazy"
                width="1400"
                height="788"
              />
              <div className="company-t">
                <h3>Inter Nation</h3>
                <p className="role">O‘qituvchilikdan HR direktorlikkacha o‘sganman</p>
                <p>Ingliz tili va IELTS o‘quv markazlari tarmog‘i.</p>
                <dl className="nums">
                  <div>
                    <dt>filial</dt>
                    <dd>16 ta</dd>
                  </div>
                  <div>
                    <dt>faol talaba</dt>
                    <dd>23 000+</dd>
                  </div>
                  <div>
                    <dt>xodim olganman</dt>
                    <dd>250+</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="light">
        <div className="wrap">
          <h2>Darslik kimlar uchun?</h2>
          <div className="badges">
            <div className="badge reveal">
              <h3>Biznes egalari</h3>
              <ul>
                <li style={{ '--i': 0 }}>Xodim 2–3 oy ishlab, ketib qoladi.</li>
                <li style={{ '--i': 1 }}>U bilan mijoz ham, pul ham ketadi.</li>
                <li style={{ '--i': 2 }}>Yangi xodim natija bermayapti.</li>
              </ul>
            </div>
            <div className="badge reveal">
              <h3>HR mutaxassislari</h3>
              <ul>
                <li style={{ '--i': 0 }}>Nomzod ketsa, sizdan so‘raladi.</li>
                <li style={{ '--i': 1 }}>Har xodimga bir xil gapni qayta aytasiz.</li>
                <li style={{ '--i': 2 }}>Rekrutingga vaqt yetmaydi.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2>
            Darsdan so‘ng <em>nimalarni bilib olasiz?</em>
          </h2>
          <div className="folders">
            <div className="folder reveal">
              <h3>Nomzodni tanlash</h3>
              <ol>
                <li style={{ '--i': 0 }}>Skrining: rezyume va hujjat</li>
                <li style={{ '--i': 1 }}>Soft skills: xarakterni ochadigan ikkita savol</li>
                <li style={{ '--i': 2 }}>Demo dars: tekshiriladigan 4 narsa</li>
                <li style={{ '--i': 3 }}>Rahbariyat suhbati: qadriyat va shartlar</li>
              </ol>
            </div>
            <div className="folder reveal">
              <h3>Xodimni ushlab qolish</h3>
              <ol>
                <li style={{ '--i': 0 }}>Xodim ketishidan oldin beradigan belgilar</li>
                <li style={{ '--i': 1 }}>Ketmoqchi xodim bilan qanday gaplashish</li>
                <li style={{ '--i': 2 }}>Bitta xodim ketishi qanchaga tushishi</li>
              </ol>
            </div>
            <div className="folder reveal">
              <h3>HR vaqtini tejash</h3>
              <ol>
                <li style={{ '--i': 0 }}>Sun’iy intellekt yordamida vaqt tejash</li>
                <li style={{ '--i': 1 }}>Ishga olishdagi 4 ta eskirgan usul</li>
                <li style={{ '--i': 2 }}>Barcha tizim yozilgan bepul qo‘llanma</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <footer>Olimjon Isxakov, 2026</footer>
      <div className={barOff ? 'bar off' : 'bar'} id="bar">
        <button className="btn" type="button" onClick={onOpen}>
          <svg className="i">
            <use href="#i-play" />
          </svg>
          Darslikni ko‘rish
        </button>
      </div>
    </div>
  );
}
