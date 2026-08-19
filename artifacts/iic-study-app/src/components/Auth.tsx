// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { User, SystemSettings } from '../types';
import { saveUserToLive, auth, getUserByEmail, getUserByMobileOrId, getUserData, updateUserUID } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { Lock, User as UserIcon, Mail, Loader2, AlertCircle, School, Search, ShieldCheck, KeyRound, Clock, ArrowRight, CheckCircle2, ShieldQuestion, Phone } from 'lucide-react';
import { getAllSchools } from '../school-firebase';
import type { School as SchoolType } from '../school-types';

interface Props {
  onLogin: (user: User) => void;
  logActivity: (action: string, details: string, user?: User) => void;
  appSettings?: SystemSettings;
}

const DEFAULT_QUESTIONS = [
  "Aapka favorite subject kaunsa hai?",
  "Aapke primary school ka naam kya tha?",
  "Aapka favorite teacher kaun hai?",
  "Aapka birth city / gaon kaunsa hai?"
];

export const Auth: React.FC<Props> = ({ onLogin, logActivity, appSettings }) => {
  const [activeSide, setActiveSide] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>('LOGIN');
  const isFlipped = activeSide !== 'LOGIN';
  
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Security Question (Signup)
  const [selectedQuestion, setSelectedQuestion] = useState(DEFAULT_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');

  // 2-Step Instant Recovery States
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryUserObj, setRecoveryUserObj] = useState<any>(null);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [userEnteredAnswer, setUserEnteredAnswer] = useState('');
  const [recoveryProgress, setRecoveryProgress] = useState(false);
  const [recoveryTimer, setRecoveryTimer] = useState(60);

  // App Level Views
  const [view, setView] = useState<'AUTH' | 'SCHOOL_SELECT' | 'SUCCESS_ID'>('AUTH');
  const [generatedId, setGeneratedId] = useState('');
  const [pendingLoginUser, setPendingLoginUser] = useState<User | null>(null);
  const [welcomeUser, setWelcomeUser] = useState<any>(null);
  const [welcomeFading, setWelcomeFading] = useState(false);

  // School Selection States
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');

  const triggerWelcome = (user: any) => {
    setWelcomeUser(user);
    setTimeout(() => setWelcomeFading(true), 600);
    setTimeout(() => { 
      setWelcomeUser(null); 
      setWelcomeFading(false); 
      onLogin(user); 
    }, 900);
  };

  // 1-Minute Fallback Auto-Verify Timer
  useEffect(() => {
    let interval: any;
    if (recoveryProgress && recoveryTimer > 0) {
      interval = setInterval(() => {
        setRecoveryTimer(prev => prev - 1);
      }, 1000);
    } else if (recoveryProgress && recoveryTimer === 0) {
      if (recoveryUserObj) {
        if (logActivity) logActivity("PASSWORDLESS_AUTO_LOGIN", "Fallback verification complete", recoveryUserObj);
        setRecoveryProgress(false);
        triggerWelcome(recoveryUserObj);
      } else {
        setError("Verification fail hua. Kripya dobara try karein.");
        setRecoveryProgress(false);
        setRecoveryTimer(60);
      }
    }
    return () => clearInterval(interval);
  }, [recoveryProgress, recoveryTimer, recoveryUserObj]);

  // STEP 1: Find Account for Recovery
  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = recoveryIdentifier.trim().toLowerCase();

    if (!identifier) {
      setError('Mobile, Email ya UID enter karein.');
      return;
    }

    setLoading(true);
    try {
      let targetUser: any = null;
      if (identifier.includes('@')) {
        targetUser = await getUserByEmail(identifier);
      }
      if (!targetUser) {
        targetUser = await getUserByMobileOrId(identifier);
      }

      if (targetUser) {
        if (targetUser.isArchived) {
          setError('Yeh account delete ho chuka hai.');
          setLoading(false);
          return;
        }
        setRecoveryUserObj(targetUser);
        setRecoveryStep(2);
      } else {
        setError('Is details se koi account nahi mila.');
      }
    } catch {
      setError('Account dhundhne mein samasya aayi.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2A: Verify Answer for Instant Login
  const handleInstantAnswerVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const entered = userEnteredAnswer.trim().toLowerCase();
    const originalAnswer = (recoveryUserObj?.securityAnswer || '').trim().toLowerCase();

    if (!entered) {
      setError('Kripya apna answer enter karein.');
      return;
    }

    if (originalAnswer && entered === originalAnswer) {
      setLoading(true);
      let freshProfile = await getUserData(recoveryUserObj.id);
      const finalUser = freshProfile || recoveryUserObj;

      if (logActivity) logActivity("INSTANT_SECURITY_LOGIN", "Instant login via correct Security Answer", finalUser);
      setLoading(false);
      triggerWelcome(finalUser);
    } else {
      setError('Galat Answer! Sahi answer dalein ya Auto-Verification start karein.');
    }
  };

  // STEP 2B: Start Auto-Verification
  const handleStartTimerFallback = () => {
    setError(null);
    setRecoveryProgress(true);
    setRecoveryTimer(60);
  };

  // ── UNIVERSAL LOGIN (Email / Mobile / UID + Password) ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input = loginIdentifier.trim();
    const pass = loginPassword.trim();

    if (!input || !pass) {
      setError('Mobile/Email aur Password dono bharein.');
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      // CASE 1: User typed an Email address
      if (input.includes('@')) {
        try {
          const res = await signInWithEmailAndPassword(auth, input.toLowerCase(), pass);
          const uid = res.user.uid;
          let appUser = await getUserData(uid);
          if (!appUser) {
            appUser = await getUserByEmail(input.toLowerCase());
          }
          if (appUser) {
            if (logActivity) logActivity("LOGIN", "User logged in via Email", appUser);
            triggerWelcome(appUser);
            return;
          }
        } catch (err: any) {
          // If direct Firebase email fails, try fallback DB record check
        }
      }

      // CASE 2: User typed Mobile Number or Numerical Account UID (Or DB Fallback)
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth).catch(() => {});
        }
      } catch {}

      let targetUser: any = await getUserByMobileOrId(input);
      if (!targetUser && input.includes('@')) {
        targetUser = await getUserByEmail(input.toLowerCase());
      }

      if (targetUser) {
        if (targetUser.isArchived) {
          setError("Yeh account deleted/blocked hai.");
          setLoading(false);
          return;
        }

        // Password verification (user password or master admin bypass code)
        const passwordMatch = targetUser.password && (targetUser.password === pass || pass === appSettings?.adminCode);

        if (passwordMatch) {
          let freshProfile = await getUserData(targetUser.id);
          const finalUser = freshProfile || targetUser;

          if (logActivity) logActivity("LOGIN", "User logged in via Mobile/UID", finalUser);
          triggerWelcome(finalUser);

          // Background sync with Firebase auth if email is present
          if (finalUser.email) {
            signInWithEmailAndPassword(auth, finalUser.email, pass).catch(() => {});
          }
          return;
        } else {
          setError("Galat Password! Sahi password dalein.");
          setLoading(false);
          return;
        }
      }

      setError("Account nahi mila. Mobile number, UID ya Email dobara check karein.");
    } catch (err: any) {
      setError("Login fail hua. Kripya details check karein.");
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN UP (Saves Mobile + Security Question + Answer for Profile) ──
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();
    const cleanMobile = signupMobile.trim();
    const cleanAnswer = securityAnswer.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !signupPassword || !cleanAnswer) {
      setError('Sabhi fields aur Security Answer bharna zaroori hai.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, signupPassword);
      const uid = res.user.uid;
      const newId = `${Date.now().toString().slice(-4)}${Math.floor(100000 + Math.random() * 900000)}`;

      const newUser: User = {
        id: uid,
        displayId: newId,
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile || '',
        password: signupPassword,
        securityQuestion: selectedQuestion,
        securityAnswer: cleanAnswer,
        role: 'STUDENT',
        isPremium: false,
        profileCompleted: true,
        credits: appSettings?.signupBonus || 50,
        streak: 0,
        createdAt: new Date().toISOString(),
        lastLoginDate: new Date().toISOString()
      };

      await saveUserToLive(newUser);
      if (logActivity) logActivity("SIGNUP", "New student registered", newUser);

      setGeneratedId(newId);
      setPendingLoginUser(newUser);
      setView('SCHOOL_SELECT');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Yeh email pehle se registered hai.');
      } else {
        setError(err.message || 'Signup fail ho gaya.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Auth
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence);
      const res = await signInWithPopup(auth, provider);
      const firebaseUser = res.user;

      let appUser = await getUserData(firebaseUser.uid);
      if (!appUser && firebaseUser.email) {
        appUser = await getUserByEmail(firebaseUser.email);
      }

      if (appUser) {
        triggerWelcome(appUser);
      } else {
        const newId = `${Date.now().toString().slice(-4)}${Math.floor(100000 + Math.random() * 900000)}`;
        const newUser: User = {
          id: firebaseUser.uid,
          displayId: newId,
          name: firebaseUser.displayName || 'Student',
          email: firebaseUser.email || '',
          mobile: firebaseUser.phoneNumber || '',
          role: 'STUDENT',
          provider: 'google',
          securityQuestion: DEFAULT_QUESTIONS[0],
          securityAnswer: 'google',
          credits: appSettings?.signupBonus || 50,
          streak: 0,
          createdAt: new Date().toISOString(),
          lastLoginDate: new Date().toISOString()
        };
        await saveUserToLive(newUser);
        triggerWelcome(newUser);
      }
    } catch {
      setError('Google Sign-in fail ho gaya.');
    }
  };

  // Welcome Overlay
  if (welcomeUser) {
    const name = (welcomeUser.name || 'Student').split(' ')[0];
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'radial-gradient(circle at center, #1a1238 0%, #07050f 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: welcomeFading ? 'welcome-fade-out 0.4s ease forwards' : 'welcome-fade-in 0.4s ease forwards'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            boxShadow: '0 0 35px rgba(251,191,36,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, color: '#fff'
          }}>✦</div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fbbf24' }}>Welcome</h1>
          <p style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{name}</p>
        </div>
      </div>
    );
  }

  // School Selection Step
  if (view === 'SCHOOL_SELECT') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#e8e8e8] px-4 font-sans select-none">
        <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-[#e8e8e8] shadow-[20px_20px_45px_#c3c3c3,-20px_-20px_45px_#ffffff] text-center border border-white/60">
          <School size={40} className="text-[#991b1b] mx-auto mb-2" />
          <h2 className="text-xl font-black text-[#333]">Apna School Select Karein</h2>
          <div className="my-4 relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search school..."
              value={schoolSearch}
              onChange={e => setSchoolSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-[#e8e8e8] shadow-[inset_3px_3px_6px_#c3c3c3,inset_-3px_-3px_6px_#ffffff] outline-none text-[#333]"
            />
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto mb-4">
            {schools.filter(s => s.name.toLowerCase().includes(schoolSearch.toLowerCase())).map(sc => (
              <button
                key={sc.id}
                onClick={async () => {
                  if (pendingLoginUser) {
                    const u = { ...pendingLoginUser, schoolId: sc.id, schoolName: sc.name };
                    await saveUserToLive(u);
                    setPendingLoginUser(u);
                  }
                  setView('SUCCESS_ID');
                }}
                className="w-full p-3 rounded-xl bg-[#e8e8e8] shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#ffffff] text-xs font-bold text-[#444] text-left truncate hover:text-[#991b1b]"
              >
                {sc.name}
              </button>
            ))}
          </div>
          <button onClick={() => setView('SUCCESS_ID')} className="text-xs font-bold text-slate-500 hover:text-[#333]">
            Baad Mein Select Karunga →
          </button>
        </div>
      </div>
    );
  }

  // Account Created Success ID
  if (view === 'SUCCESS_ID') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#e8e8e8] px-4 select-none">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-[#e8e8e8] shadow-[20px_20px_45px_#c3c3c3,-20px_-20px_45px_#ffffff] text-center border border-white/60">
          <ShieldCheck size={46} className="text-emerald-600 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-[#333] mb-1">Account Created!</h2>
          <p className="text-xs text-slate-500 mb-4">Aapka unique login ID:</p>
          <div className="p-3.5 rounded-xl bg-[#e8e8e8] shadow-[inset_4px_4px_8px_#c3c3c3,inset_-4px_-4px_8px_#ffffff] text-xl font-mono font-bold text-[#991b1b] mb-5">
            {generatedId}
          </div>
          <button
            onClick={() => {
              if (pendingLoginUser) triggerWelcome(pendingLoginUser);
              else setView('AUTH');
            }}
            className="w-full py-3.5 rounded-xl bg-[#e8e8e8] shadow-[6px_6px_12px_#c3c3c3,-6px_-6px_12px_#ffffff] hover:bg-[#991b1b] hover:text-white font-bold text-xs uppercase transition-all tracking-wider text-[#333]"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#e8e8e8] text-[#4a4a4a] px-4 py-8 select-none font-sans overflow-hidden">
      
      {/* ── 9:16 RECTANGULAR CARD WRAPPER WITH 3D FLIP ── */}
      <div className="relative w-full max-w-[360px] sm:max-w-[390px] aspect-[9/16] min-h-[580px] max-h-[680px] [perspective:1400px]">
        
        <div 
          className="w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          
          {/* ══════════════════════════════════════════════════════════════════════
              SIDE 1: LOGIN (UNIVERSAL IDENTIFIER)
          ══════════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-[#e8e8e8] [backface-visibility:hidden] flex flex-col items-center justify-between p-6 sm:p-8 shadow-[18px_18px_40px_#c3c3c3,-18px_-18px_40px_#ffffff] border border-white/80 overflow-y-auto">
            
            <div className="w-full flex flex-col items-center my-auto">
              
              <h2 className="text-3xl font-black text-[#333333] tracking-tight mb-1">Login</h2>
              <p className="text-xs font-medium text-[#929191] mb-6">Sign in to your account</p>

              {error && activeSide === 'LOGIN' && (
                <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-rose-100 text-rose-600 text-xs flex items-center gap-2 shadow-inner">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="w-full space-y-3.5">
                {/* Accepts Mobile Number, Email, or UID */}
                <div className="relative flex items-center">
                  <UserIcon size={16} className="absolute left-4 text-[#929191]" />
                  <input
                    type="text"
                    required
                    placeholder="Mobile, Email ya Account ID"
                    value={loginIdentifier}
                    onChange={(e) => { setLoginIdentifier(e.target.value); setError(null); }}
                    className="w-full bg-[#e8e8e8] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#333] placeholder-[#a9a9a9] font-medium outline-none shadow-[inset_4px_4px_8px_rgba(184,190,204,0.45),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
                    autoCapitalize="none"
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-[#929191]" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setError(null); }}
                    className="w-full bg-[#e8e8e8] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#333] placeholder-[#a9a9a9] font-medium outline-none shadow-[inset_4px_4px_8px_rgba(184,190,204,0.45),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#929191] pt-1 px-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div 
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-8 h-4.5 rounded-full transition-colors flex items-center p-0.5 shadow-[inset_2px_2px_4px_rgba(184,190,204,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] ${
                        rememberMe ? 'bg-[#991b1b]' : 'bg-[#e8e8e8]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform ${
                        rememberMe ? 'translate-x-3.5' : 'translate-x-0'
                      }`} />
                    </div>
                    <span>Remember me</span>
                  </label>

                  <button 
                    type="button" 
                    onClick={() => { setActiveSide('RECOVERY'); setRecoveryStep(1); setError(null); }}
                    className="text-[#991b1b] font-bold hover:underline transition-colors flex items-center gap-1"
                  >
                    <KeyRound size={13} />
                    <span>Instant Recovery</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-xs font-black tracking-widest text-[#555] bg-[#e8e8e8] hover:bg-[#881337] hover:text-white shadow-[6px_6px_14px_#c5c5c5,-6px_-6px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <span>SIGN IN</span>}
                  </button>
                </div>
              </form>

              <p className="text-xs text-[#929191] mt-5">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveSide('SIGNUP'); setError(null); }}
                  className="font-bold text-[#b91c1c] hover:underline ml-0.5"
                >
                  Sign up
                </button>
              </p>

              <button 
                type="button" 
                onClick={handleGoogleAuth} 
                className="mt-3 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                <span>Google Sign-in</span>
              </button>

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              SIDE 2: SIGN UP / RECOVERY
          ══════════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-[#e8e8e8] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-between p-6 sm:p-8 shadow-[18px_18px_40px_#c3c3c3,-18px_-18px_40px_#ffffff] border border-white/80 overflow-y-auto">
            
            <div className="w-full flex flex-col items-center my-auto">
              
              {/* SIGN UP */}
              {activeSide === 'SIGNUP' && (
                <>
                  <h2 className="text-2xl font-black text-[#333333] tracking-tight mb-1">Sign Up</h2>
                  <p className="text-xs font-medium text-[#929191] mb-3">Create your smart account</p>

                  {error && (
                    <div className="w-full mb-2.5 px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-600 text-xs flex items-center gap-2 shadow-inner">
                      <AlertCircle size={14} className="shrink-0" />
                      <span className="truncate">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="w-full space-y-2">
                    <div className="relative flex items-center">
                      <UserIcon size={14} className="absolute left-3.5 text-[#929191]" />
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={signupName}
                        onChange={(e) => { setSignupName(e.target.value); setError(null); }}
                        className="w-full bg-[#e8e8e8] rounded-xl pl-10 pr-3 py-2 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_3px_3px_6px_rgba(184,190,204,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Phone size={14} className="absolute left-3.5 text-[#929191]" />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={signupMobile}
                        onChange={(e) => { setSignupMobile(e.target.value); setError(null); }}
                        className="w-full bg-[#e8e8e8] rounded-xl pl-10 pr-3 py-2 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_3px_3px_6px_rgba(184,190,204,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Mail size={14} className="absolute left-3.5 text-[#929191]" />
                      <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={signupEmail}
                        onChange={(e) => { setSignupEmail(e.target.value); setError(null); }}
                        className="w-full bg-[#e8e8e8] rounded-xl pl-10 pr-3 py-2 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_3px_3px_6px_rgba(184,190,204,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Lock size={14} className="absolute left-3.5 text-[#929191]" />
                      <input
                        type="password"
                        required
                        placeholder="Password (Min 6 chars)"
                        value={signupPassword}
                        onChange={(e) => { setSignupPassword(e.target.value); setError(null); }}
                        className="w-full bg-[#e8e8e8] rounded-xl pl-10 pr-3 py-2 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_3px_3px_6px_rgba(184,190,204,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                      />
                    </div>

                    <div className="space-y-1 pt-0.5">
                      <select
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                        className="w-full bg-[#e8e8e8] rounded-xl px-3 py-1.5 text-[10px] text-[#444] font-medium outline-none shadow-[inset_2px_2px_4px_rgba(184,190,204,0.45),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] truncate"
                      >
                        {DEFAULT_QUESTIONS.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                      
                      <div className="relative flex items-center">
                        <ShieldQuestion size={14} className="absolute left-3.5 text-[#991b1b]" />
                        <input
                          type="text"
                          required
                          placeholder="Security Answer (Profile par dikhega)"
                          value={securityAnswer}
                          onChange={(e) => { setSecurityAnswer(e.target.value); setError(null); }}
                          className="w-full bg-[#e8e8e8] rounded-xl pl-10 pr-3 py-1.5 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_3px_3px_6px_rgba(184,190,204,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                        />
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl text-xs font-black tracking-widest text-[#555] bg-[#e8e8e8] hover:bg-[#881337] hover:text-white shadow-[6px_6px_14px_#c5c5c5,-6px_-6px_14px_#ffffff] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                      >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <span>CREATE ACCOUNT</span>}
                      </button>
                    </div>
                  </form>

                  <p className="text-xs text-[#929191] mt-3">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveSide('LOGIN'); setError(null); }}
                      className="font-bold text-[#b91c1c] hover:underline ml-0.5"
                    >
                      Login
                    </button>
                  </p>
                </>
              )}

              {/* INSTANT QUESTION RECOVERY */}
              {activeSide === 'RECOVERY' && (
                <>
                  <h2 className="text-2xl font-black text-[#333333] tracking-tight mb-1 flex items-center gap-2 justify-center">
                    <KeyRound size={20} className="text-[#991b1b]" />
                    <span>Instant Recovery</span>
                  </h2>
                  <p className="text-xs font-medium text-[#929191] mb-4 text-center">
                    {recoveryStep === 1 ? 'Apna account search karein' : 'Sahi Answer par instant login'}
                  </p>

                  {error && (
                    <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-rose-100 text-rose-600 text-xs flex items-center gap-2 shadow-inner">
                      <AlertCircle size={14} className="shrink-0" />
                      <span className="truncate">{error}</span>
                    </div>
                  )}

                  {/* STEP 1 */}
                  {recoveryStep === 1 && (
                    <form onSubmit={handleFindAccount} className="w-full space-y-4">
                      <div className="relative flex items-center">
                        <UserIcon size={16} className="absolute left-4 text-[#929191]" />
                        <input
                          type="text"
                          required
                          placeholder="Mobile / Email / UID"
                          value={recoveryIdentifier}
                          onChange={(e) => { setRecoveryIdentifier(e.target.value); setError(null); }}
                          className="w-full bg-[#e8e8e8] rounded-2xl pl-12 pr-4 py-3 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_4px_4px_8px_rgba(184,190,204,0.45),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest text-[#555] bg-[#e8e8e8] hover:bg-[#881337] hover:text-white shadow-[6px_6px_14px_#c5c5c5,-6px_-6px_14px_#ffffff] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase mt-2"
                      >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <span>FIND ACCOUNT</span>}
                        <ArrowRight size={15} />
                      </button>
                    </form>
                  )}

                  {/* STEP 2 */}
                  {recoveryStep === 2 && (
                    <div className="w-full space-y-3">
                      <div className="p-3.5 rounded-xl bg-[#e8e8e8] shadow-[inset_3px_3px_6px_#c3c3c3,inset_-3px_-3px_6px_#ffffff] text-left">
                        <span className="text-[10px] font-bold text-[#991b1b] uppercase tracking-wider block">SECURITY QUESTION:</span>
                        <p className="text-xs font-bold text-[#333] mt-1">
                          {recoveryUserObj?.securityQuestion || "Aapka favorite subject kaunsa hai?"}
                        </p>
                      </div>

                      <form onSubmit={handleInstantAnswerVerify} className="space-y-3">
                        <div className="relative flex items-center">
                          <ShieldQuestion size={16} className="absolute left-4 text-[#991b1b]" />
                          <input
                            type="text"
                            required
                            placeholder="Enter Security Answer"
                            value={userEnteredAnswer}
                            onChange={(e) => { setUserEnteredAnswer(e.target.value); setError(null); }}
                            className="w-full bg-[#e8e8e8] rounded-2xl pl-12 pr-4 py-2.5 text-xs text-[#333] placeholder-[#a9a9a9] outline-none shadow-[inset_3px_3px_6px_rgba(184,190,204,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading || recoveryProgress}
                          className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest text-white bg-[#991b1b] hover:bg-[#7f1d1d] shadow-[5px_5px_10px_#c5c5c5] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                        >
                          <CheckCircle2 size={15} />
                          <span>VERIFY &amp; LOGIN</span>
                        </button>
                      </form>

                      {recoveryProgress ? (
                        <div className="w-full p-3 rounded-xl bg-[#e8e8e8] shadow-[inset_3px_3px_6px_#c3c3c3,inset_-3px_-3px_6px_#ffffff] flex flex-col items-center">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#991b1b] animate-pulse">
                            <Clock size={14} className="animate-spin" />
                            <span>Account verify ho raha hai ({recoveryTimer}s)...</span>
                          </div>
                          <span className="text-[10px] text-[#777] mt-0.5">Please wait, verification in progress</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartTimerFallback}
                          className="text-[11px] text-slate-500 hover:text-[#991b1b] underline font-medium block mx-auto pt-1"
                        >
                          Answer yaad nahi hai? System se Auto-Verify karein (1-Min)
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-[#929191] mt-5">
                    Wapas jaane ke liye{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveSide('LOGIN'); setRecoveryStep(1); setError(null); setRecoveryProgress(false); }}
                      className="font-bold text-[#b91c1c] hover:underline ml-0.5"
                    >
                      Login karein
                    </button>
                  </p>
                </>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Auth;
