import { useEffect, useRef, useState } from 'react';
import { CONFIG, formatPhone, wait } from '../utils/lead.js';

export default function KirishView({ isActive, isEntered, onGoHome, onSuccess }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [badName, setBadName] = useState(false);
  const [badPhone, setBadPhone] = useState(false);
  const [formErr, setFormErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const nameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setName('');
      setPhone('');
      setBadName(false);
      setBadPhone(false);
      setFormErr(false);
    }
  }, [isActive]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (val.trim().length >= 2) setBadName(false);
  };

  const handlePhoneChange = (e) => {
    let d = e.target.value.replace(/\D/g, '');
    if (d.startsWith('998') && d.length > 9) d = d.slice(3);
    d = d.slice(0, 9);
    setPhone(formatPhone(d));
    if (d.length === 9) setBadPhone(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, '');
    const isNameBad = trimmedName.length < 2;
    const isPhoneBad = digits.length !== 9;

    setBadName(isNameBad);
    setBadPhone(isPhoneBad);
    setFormErr(false);

    if (isNameBad) {
      nameRef.current?.focus();
      return;
    }
    if (isPhoneBad) {
      phoneRef.current?.focus();
      return;
    }

    const value = { name: trimmedName, phone: '+998' + digits };
    setSubmitting(true);
    try {
      if (CONFIG.leadEndpoint) {
        const res = await fetch(CONFIG.leadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });
        if (!res.ok) throw new Error(String(res.status));
      }
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setShowDone(true);
      await wait(1300);
      setShowDone(false);
      onSuccess(value);
    } catch {
      setFormErr(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={isActive && isEntered ? 'view enter' : 'view'}
        id="kirish"
        hidden={!isActive}
      >
        <div className="nav">
          <div className="wrap">
            <button className="back" type="button" onClick={onGoHome}>
              <svg className="i">
                <use href="#i-left" />
              </svg>
              Orqaga
            </button>
          </div>
        </div>
        <main className="page">
          <h1>Ro‘yxatdan o‘ting</h1>
          <p className="intro">
            Darslikni ko‘rish uchun ismingiz va telefon raqamingizni yozing.
          </p>
          <form className="form" id="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <div className={badName ? 'field bad' : 'field'} id="fName">
              <div className="box">
                <input
                  ref={nameRef}
                  id="name"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="words"
                  maxLength={60}
                  placeholder=" "
                  enterKeyHint="next"
                  value={name}
                  onChange={handleNameChange}
                />
                <label htmlFor="name">Ismingizni kiriting</label>
              </div>
              <p className="err" hidden={!badName}>
                Ismingizni yozing.
              </p>
            </div>
            <div className={badPhone ? 'field bad' : 'field'} id="fPhone">
              <div className="box">
                <span className="pre">+998</span>
                <input
                  ref={phoneRef}
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="90 123 45 67"
                  enterKeyHint="done"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                <label htmlFor="phone">Telefon raqamingizni kiriting</label>
              </div>
              <p className="err" hidden={!badPhone}>
                Raqamni to‘liq yozing: 9 ta raqam.
              </p>
            </div>
            <p className="fine">Raqamingiz menga faqat siz bilan bog‘lanish uchun kerak.</p>
            <p className="err" id="formErr" role="alert" hidden={!formErr}>
              Yuborilmadi. Internetni tekshirib, qayta urinib ko‘ring.
            </p>
            <button className="btn" type="submit" id="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spin" />
                  Yuborilmoqda
                </>
              ) : (
                'Davom etish'
              )}
            </button>
          </form>
        </main>
      </div>

      <div className="done" id="done" role="status" hidden={!showDone}>
        <div className="done-box">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="32" />
            <path d="M20 33l8 8 17-18" />
          </svg>
          Yuborildi
        </div>
      </div>
    </>
  );
}
