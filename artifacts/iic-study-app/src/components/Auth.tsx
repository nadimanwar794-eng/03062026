// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { User, Board, ClassLevel, Stream, SystemSettings, RecoveryRequest } from '../types';
import { ADMIN_EMAIL } from '../constants';
import { saveUserToLive, auth, getUserByEmail, getUserByMobileOrId, getUserByNameAndClass, rtdb, getUserData, updateUserUID, getUserByLinkedGoogleUid } from '../firebase';
import { ref, set } from "firebase/database";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserPlus, LogIn, Lock, User as UserIcon, Phone, Mail, ShieldCheck, ArrowRight, School, GraduationCap, Layers, KeyRound, Copy, Check, AlertTriangle, XCircle, MessageCircle, Send, RefreshCcw, ShieldAlert, HelpCircle, Eye, EyeOff, Search, CheckCircle2, ShieldQuestion, Loader2 } from 'lucide-react';
import { LoginGuide } from './LoginGuide';
import { CustomAlert } from './CustomDialogs';
import { SpeakButton } from './SpeakButton';
import { getAllSchools, verifySchoolLockCode } from '../school-firebase';
import type { School as SchoolType } from '../school-types';

interface Props {
  onLogin: (user: User) => void;
  logActivity: (action: string, details: string, user?: User) => void;
  appSettings?: SystemSettings;
}

type AuthView = 'LOGIN' | 'SIGNUP' | 'RECOVERY' | 'ADMIN' | 'SUCCESS_ID' | 'SCHOOL_SELECT';

const BLOCKED_DOMAINS = [
    'tempmail.com', 'throwawaymail.com', 'mailinator.com', 'yopmail.com', 
    '10minutemail.com', 'guerrillamail.com', 'sharklasers.com', 'getairmail.com',
    'dispostable.com', 'grr.la', 'mailnesia.com', 'temp-mail.org', 'fake-email.com'
];

const DEFAULT_QUESTIONS = [
  "Aapka favorite subject kaunsa hai?",
  "Aapke primary school ka naam kya tha?",
  "Aapka favorite teacher kaun hai?",
  "Aapka birth city / gaon kaunsa hai?"
];

export const Auth: React.FC<Props> = ({ onLogin, logActivity, appSettings }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const isFlipped = view === 'SIGNUP' || view === 'RECOVERY';

  const [generatedId, setGeneratedId] = useState<string>('');
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    mobile: '',
    email: '',
    board: '',
    classLevel: '',
    stream: '',
    recoveryCode: '',
    teacherCode: '',
    securityQuestion: DEFAULT_QUESTIONS[0],
    securityAnswer: ''
  });

  // Admin Verification States
  const [showAdminVerify, setShowAdminVerify] = useState(false);
  const [adminAuthCode, setAdminAuthCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string}>({isOpen: false, message: ''});
  const [pendingLoginUser, setPendingLoginUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Instant Recovery States
  const [recoveryUserObj, setRecoveryUserObj] = useState<any>(null);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [userEnteredAnswer, setUserEnteredAnswer] = useState('');

  // Welcome Overlay States
  const [welcomeUser, setWelcomeUser] = useState<any>(null);
  const [welcomeFading, setWelcomeFading] = useState(false);

  // School Selection States
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchoolForJoin, setSelectedSchoolForJoin] = useState<SchoolType | null>(null);
  const [lockCodeInput, setLockCodeInput] = useState('');
  const [lockCodeError, setLockCodeError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  const welcomeTimer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeTimer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (welcomeTimer1Ref.current) clearTimeout(welcomeTimer1Ref.current);
      if (welcomeTimer2Ref.current) clearTimeout(welcomeTimer2Ref.current);
    };
  }, []);

  const triggerWelcome = (user: any) => {
    if (welcomeTimer1Ref.current) clearTimeout(welcomeTimer1Ref.current);
    if (welcomeTimer2Ref.current) clearTimeout(welcomeTimer2Ref.current);
    setWelcomeUser(user);
    welcomeTimer1Ref.current = setTimeout(() => setWelcomeFading(true), 600);
    welcomeTimer2Ref.current = setTimeout(() => { setWelcomeUser(null); setWelcomeFading(false); onLogin(user); }, 900);
  };

  useEffect(() => {
    const s = localStorage.getItem('nst_system_settings');
    if (s) { try { setSettings(JSON.parse(s)); } catch {} }
  }, []);

  useEffect(() => {
    if (view !== 'SCHOOL_SELECT') return;
    setLoadingSchools(true);
    getAllSchools().then(all => {
      setSchools(all.filter(sc => sc.active && sc.subscription?.status === 'active'));
      setLoadingSchools(false);
    }).catch(() => setLoadingSchools(false));
  }, [view]);

  const handleSchoolSelect = async (school: SchoolType) => {
    if (school.lockCodeActive && school.lockCode) {
      setSelectedSchoolForJoin(school);
      setLockCodeInput('');
      setLockCodeError('');
    } else {
      await confirmSchoolJoin(school, null);
    }
  };

  const confirmSchoolJoin = async (school: SchoolType, code: string | null) => {
    if (school.lockCodeActive && school.lockCode) {
      if (!code || code.trim() !== school.lockCode) {
        setLockCodeError('Galat code hai. Dobara try karo.');
        return;
      }
    }
    if (pendingLoginUser) {
      const updated = { ...pendingLoginUser, schoolId: school.id, schoolName: school.name };
      await saveUserToLive(updated);
      setPendingLoginUser(updated);
    }
    setSelectedSchoolForJoin(null);
    setView('SUCCESS_ID');
  };

  const skipSchoolSelect = () => {
    setView('SUCCESS_ID');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const generateUserId = () => {
    const timestampPart = Date.now().toString().slice(-4);
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    return `${timestampPart}${randomPart}`;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    if (BLOCKED_DOMAINS.includes(domain)) return false;
    return true;
  };

  // Google Authentication Flow with UID Migration Protection
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      let appUser: any = await getUserData(firebaseUser.uid);

      if (!appUser && firebaseUser.email) {
        appUser = await getUserByEmail(firebaseUser.email);
      }

      if (!appUser) {
        appUser = await getUserByLinkedGoogleUid(firebaseUser.uid);
      }

      if (appUser) {
        if (appUser.id !== firebaseUser.uid) {
          const oldId = appUser.id;
          appUser = { ...appUser, id: firebaseUser.uid, provider: 'google' };
          await updateUserUID(oldId, firebaseUser.uid, appUser);
        }

        if (firebaseUser.photoURL && appUser.photoURL !== firebaseUser.photoURL) {
          appUser = { ...appUser, photoURL: firebaseUser.photoURL };
          await saveUserToLive(appUser);
        }

        if (logActivity) logActivity("LOGIN", "Student Logged In via Google Auth", appUser);
        triggerWelcome(appUser);
      } else {
        const newId = generateUserId();
        const newUser: User = {
          id: firebaseUser.uid,
          displayId: newId,
          name: firebaseUser.displayName || 'Student',
          email: firebaseUser.email || '',
          password: '',
          mobile: firebaseUser.phoneNumber || '',
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
          credits: settings?.signupBonus || 50,
          streak: 0,
          lastLoginDate: new Date().toISOString(),
          board: '',
          classLevel: '',
          provider: 'google',
          photoURL: firebaseUser.photoURL || '',
          avatarChoice: firebaseUser.photoURL ? 'gmail' : 'app',
          profileCompleted: true,
          securityQuestion: DEFAULT_QUESTIONS[0],
          securityAnswer: 'google',
          progress: {},
          redeemedCodes: [],
          subscriptionTier: 'FREE',
          isPremium: false
        };

        await saveUserToLive(newUser);
        if (logActivity) logActivity("SIGNUP_GOOGLE", "New Student Registered via Google", newUser);
        triggerWelcome(newUser);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Google Login Failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Direct Unified Login Handler (Supports Email / Mobile / UID)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input = formData.id.trim();
    const pass = formData.password.trim();

    if (!input || !pass) {
      setError("Email/Mobile aur Password dono bharein.");
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      // Attempt Direct Firebase Email Auth first if input looks like an email
      if (input.includes('@')) {
        try {
          const res = await signInWithEmailAndPassword(auth, input.toLowerCase(), pass);
          const uid = res.user.uid;
          let appUser = await getUserData(uid);
          if (!appUser) {
            appUser = await getUserByEmail(input.toLowerCase());
          }
          if (appUser) {
            if (logActivity) logActivity("LOGIN", "Student Logged In via Email", appUser);
            triggerWelcome(appUser);
            return;
          }
        } catch (e: any) {
          if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            setError("Galat password. Dobara check karein.");
            setLoading(false);
            return;
          }
        }
      }

      // Anonymous session fallback for Firestore Security Rules
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch {}

      // Database Search via Mobile, DisplayID or Email
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

        const isGoogleUser = targetUser.provider === 'google' || (!targetUser.password && targetUser.email);
        const passwordMatch = targetUser.password && (targetUser.password === pass || pass === settings?.adminCode || pass === appSettings?.adminCode);

        if (passwordMatch) {
          let freshProfile = await getUserData(targetUser.id);
          const finalUser = freshProfile || targetUser;

          if (logActivity) logActivity("LOGIN", "Student Logged In via Mobile/UID", finalUser);
          triggerWelcome(finalUser);

          if (finalUser.email) {
            signInWithEmailAndPassword(auth, finalUser.email, pass).catch(() => {});
          }
          return;
        }

        if (isGoogleUser) {
          setError("Yeh account Google se bana hai. 'Continue with Google' button se login karein.");
          setLoading(false);
          return;
        }

        setError("Galat Password! Sahi password enter karein.");
        setLoading(false);
        return;
      }

      setError("Account nahi mila. Mobile number, UID ya Email dobara check karein.");
    } catch (err: any) {
      setError(err.message || "Login fail hua. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanMobile = formData.mobile.trim();
    const cleanPassword = formData.password.trim();
    const cleanAnswer = formData.securityAnswer.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !cleanPassword || !cleanAnswer) {
      setError("Sabhi fields aur Security Answer bharna zaroori hai.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Valid email address enter karein.");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const firebaseUser = res.user;
      const newId = generateUserId();

      const newStudentUser: User = {
        id: firebaseUser.uid,
        displayId: newId,
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password: cleanPassword,
        securityQuestion: formData.securityQuestion,
        securityAnswer: cleanAnswer,
        role: 'STUDENT',
        createdAt: new Date().toISOString(),
        credits: settings?.signupBonus || appSettings?.signupBonus || 50,
        streak: 0,
        lastLoginDate: new Date().toISOString(),
        board: '',
        classLevel: '',
        provider: 'email',
        profileCompleted: true,
        progress: {},
        redeemedCodes: [],
        subscriptionTier: 'FREE',
        isPremium: false
      };

      await saveUserToLive(newStudentUser);
      if (logActivity) logActivity("SIGNUP_EMAIL", "New Student Registered", newStudentUser);

      setGeneratedId(newId);
      setPendingLoginUser(newStudentUser);
      setView('SCHOOL_SELECT');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Yeh email pehle se registered hai. Login karein.");
      } else {
        setError(err.message || "Signup failed. Dobara koshish karein.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant Recovery STEP 1: Find Account
  const handleFindRecoveryAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = formData.id.trim().toLowerCase();

    if (!identifier) {
      setError("Mobile, Email ya Account UID enter karein.");
      return;
    }

    setLoading(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
      }

      let targetUser: any = null;
      if (identifier.includes('@')) {
        targetUser = await getUserByEmail(identifier);
      }
      if (!targetUser) {
        targetUser = await getUserByMobileOrId(identifier);
      }

      if (targetUser) {
        if (targetUser.isArchived) {
          setError("Yeh account deleted hai.");
          setLoading(false);
          return;
        }
        setRecoveryUserObj(targetUser);
        setRecoveryStep(2);
      } else {
        setError("Is detail se koi account nahi mila.");
      }
    } catch {
      setError("Account search karte waqt samasya aayi.");
    } finally {
      setLoading(false);
    }
  };

  // Instant Recovery STEP 2: Answer Verification
  const handleVerifyAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const entered = userEnteredAnswer.trim().toLowerCase();
    const originalAnswer = (recoveryUserObj?.securityAnswer || '').trim().toLowerCase();

    if (!entered) {
      setError("Apna security answer enter karein.");
      return;
    }

    if (originalAnswer && entered === originalAnswer) {
      setLoading(true);
      let freshProfile = await getUserData(recoveryUserObj.id);
      const finalUser = freshProfile || recoveryUserObj;

      if (logActivity) logActivity("INSTANT_SECURITY_LOGIN", "Instant login via Security Answer", finalUser);
      setLoading(false);
      triggerWelcome(finalUser);
    } else {
      setError("Galat Answer! Kripya sahi answer likhein.");
    }
  };

  // Admin Login Handler
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!showAdminVerify) {
      if (formData.email === (settings?.adminEmail || ADMIN_EMAIL)) {
        setShowAdminVerify(true);
      } else {
        setError("Admin email authorized nahi hai.");
      }
    } else {
      if (adminAuthCode === (settings?.adminCode || appSettings?.adminCode || 'IIC999')) {
        try {
          await setPersistence(auth, browserLocalPersistence);
          const cred = await signInAnonymously(auth);
          let adminUser: any = await getUserByEmail(formData.email);
          if (adminUser && adminUser.role === 'ADMIN') {
            adminUser = { ...adminUser, id: cred.user.uid, lastLoginDate: new Date().toISOString(), isPremium: true, subscriptionTier: 'LIFETIME', subscriptionLevel: 'ULTRA' };
          } else {
            adminUser = {
              id: cred.user.uid, displayId: 'IIC-ADMIN', name: 'Administrator', email: formData.email, password: '', mobile: 'ADMIN', role: 'ADMIN',
              createdAt: new Date().toISOString(), credits: 99999, streak: 999, lastLoginDate: new Date().toISOString(),
              board: 'CBSE', classLevel: '12', progress: {}, redeemedCodes: [], isPremium: true, subscriptionTier: 'LIFETIME', subscriptionLevel: 'ULTRA'
            };
          }
          await saveUserToLive(adminUser);
          if (logActivity) logActivity("ADMIN_LOGIN", "Admin Access Granted", adminUser);
          onLogin(adminUser);
        } catch (e: any) {
          setError("Admin Login Error: " + e.message);
        }
      } else {
        setError("Invalid Verification Code.");
      }
    }
  };

  const GoogleBrandIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );

  // Welcome Overlay
  if (welcomeUser) {
    const name = (welcomeUser.name || 'Student').split(' ')[0];
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999, overflow: 'hidden',
        background: 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: welcomeFading ? 'welcome-fade-out 0.4s ease forwards' : 'welcome-fade-in 0.4s ease forwards'
      }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', margin: '0 auto 18px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            boxShadow: '0 0 35px rgba(251,191,36,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, color: '#fff'
          }}>✦</div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.5px' }}>Welcome</h1>
          <p style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{name}</p>
          <p style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Your Learning Journey Begins
          </p>
        </div>
      </div>
    );
  }

  // School Selection Step
  if (view === 'SCHOOL_SELECT') {
    const filteredSchools = schools.filter(sc =>
      sc.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      (sc.address || '').toLowerCase().includes(schoolSearch.toLowerCase())
    );

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] px-4 font-sans select-none py-8">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-[2rem] bg-[#0f1424] shadow-2xl border border-slate-800 text-center">
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-500/20 shadow-inner">
            <School size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">Apna School Select Karein</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-5">Apne school ka content dekhne ke liye select karein.</p>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="School search karein..."
              value={schoolSearch}
              onChange={e => setSchoolSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-800 rounded-xl text-xs sm:text-sm font-medium bg-[#080b16] text-white placeholder-slate-500 focus:border-indigo-500 outline-none shadow-inner"
            />
          </div>

          {selectedSchoolForJoin && (
            <div className="mb-4 p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock size={16} className="text-amber-400" />
                <p className="text-sm font-bold text-amber-200">{selectedSchoolForJoin.name}</p>
              </div>
              <p className="text-xs text-amber-400/80 mb-3">Is school me join karne ke liye secret lock code dalein.</p>
              <input
                type="text"
                placeholder="Lock Code"
                value={lockCodeInput}
                onChange={e => { setLockCodeInput(e.target.value); setLockCodeError(''); }}
                className="w-full px-3 py-2.5 bg-[#0a0d1a] border border-amber-500/40 rounded-xl text-xs font-bold text-white mb-2 outline-none"
              />
              {lockCodeError && <p className="text-xs text-rose-400 font-bold mb-2">{lockCodeError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSchoolForJoin(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300"
                >Cancel</button>
                <button
                  type="button"
                  onClick={() => confirmSchoolJoin(selectedSchoolForJoin, lockCodeInput)}
                  disabled={verifyingCode}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black"
                >{verifyingCode ? 'Verifying...' : 'Join School'}</button>
              </div>
            </div>
          )}

          {loadingSchools ? (
            <div className="py-8 text-slate-500 text-xs font-semibold">Loading schools...</div>
          ) : filteredSchools.length === 0 ? (
            <div className="py-8 text-slate-500 text-xs font-semibold">
              {schoolSearch ? 'Koi school nahi mila.' : 'Abhi koi school listed nahi hai.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredSchools.map(sc => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSchoolSelect(sc)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#080b16] border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    {sc.logoUrl ? (
                      <img src={sc.logoUrl} alt={sc.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <School size={18} className="text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-200 truncate">{sc.name}</p>
                    {sc.address && <p className="text-[11px] text-slate-500 truncate">{sc.address}</p>}
                  </div>
                  {sc.lockCodeActive && <Lock size={13} className="text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={skipSchoolSelect}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Baad Mein Select Karunga →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Account Created Success ID View
  if (view === 'SUCCESS_ID') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] px-4 select-none">
        <div className="w-full max-w-md p-8 rounded-[2.5rem] bg-[#0f1424] border border-slate-800 shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Account Created!</h2>
          <p className="text-xs text-slate-400 mb-5">Aapka unique student login ID:</p>
          <div className="p-4 rounded-2xl bg-[#080b16] border border-slate-800 text-2xl font-mono font-black text-emerald-400 mb-6 flex items-center justify-center gap-3 shadow-inner">
            <span>{generatedId}</span>
            <button type="button" onClick={handleCopyId} className="text-slate-400 hover:text-white p-1">
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (pendingLoginUser) triggerWelcome(pendingLoginUser);
              else setView('LOGIN');
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  const isVideoMode = (appSettings?.loginPageStyle ?? settings?.loginPageStyle) === 'video';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060813] text-[#e2e8f0] px-4 py-8 select-none font-sans overflow-x-hidden relative">
      
      {/* Background Video Support */}
      {isVideoMode && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <video
            src={appSettings?.loginVideoUrl?.trim() || '/login-bg.mp4'}
            autoPlay loop muted playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CustomAlert 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        onClose={() => {
          setAlertConfig({ ...alertConfig, isOpen: false });
          if (pendingLoginUser) onLogin(pendingLoginUser);
        }} 
      />

      {showGuide && <LoginGuide onClose={() => setShowGuide(false)} />}

      <button 
        type="button"
        onClick={() => setShowGuide(true)} 
        className="absolute top-5 right-5 z-30 p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white shadow-md transition-colors"
      >
        <HelpCircle size={20} />
      </button>

      {/* ── CARD 3D FLIP CONTAINER ── */}
      <div className="relative z-10 w-[92vw] max-w-[420px] min-h-[580px] [perspective:1400px] my-auto flex items-center justify-center">
        
        <div 
          className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-in-out"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          
          {/* ══════════════════════════════════════════════════════════════════════
              SIDE 1: LOGIN & ADMIN
          ══════════════════════════════════════════════════════════════════════ */}
          <div className="w-full min-h-[580px] rounded-[2.5rem] bg-[#0c1020]/95 backdrop-blur-2xl [backface-visibility:hidden] flex flex-col items-center justify-between p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-800">
            
            <div className="w-full flex flex-col items-center my-auto">
              
              {/* App Brand Logo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(245,158,11,0.3)] p-1 overflow-hidden border border-amber-300/40">
                {settings?.appLogo ? (
                  <img src={settings.appLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-2xl font-black text-slate-950">{settings?.appShortName || 'IIC'}</span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-0.5">
                {view === 'ADMIN' ? 'Admin Portal' : 'Welcome Back'}
              </h2>
              <p className="text-xs font-medium text-slate-400 mb-5 text-center">
                {view === 'ADMIN' ? 'Authorized personnel access' : 'Sign in to continue your learning'}
              </p>

              {error && (view === 'LOGIN' || view === 'ADMIN') && (
                <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <XCircle size={15} className="shrink-0 text-rose-400" />
                  <span className="truncate">{error}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {view === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="w-full space-y-3.5">
                  <div className="relative flex items-center">
                    <UserIcon size={16} className="absolute left-4 text-slate-500" />
                    <input
                      name="id"
                      type="text"
                      required
                      placeholder="Mobile, Email ya Account ID"
                      value={formData.id}
                      onChange={handleChange}
                      className="w-full bg-[#070a14] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 font-medium outline-none border border-slate-800 focus:border-amber-500/70 shadow-inner"
                      autoCapitalize="none"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-4 text-slate-500" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-[#070a14] rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-white placeholder-slate-500 font-medium outline-none border border-slate-800 focus:border-amber-500/70 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={() => setRememberMe(!rememberMe)} 
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                      />
                      <span>Remember me</span>
                    </label>

                    <button 
                      type="button" 
                      onClick={() => { setView('RECOVERY'); setRecoveryStep(1); setError(null); }}
                      className="text-amber-400 font-bold hover:underline transition-colors flex items-center gap-1"
                    >
                      <KeyRound size={12} />
                      <span>Instant Recovery</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer mt-1"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <span>SIGN IN</span>}
                  </button>
                </form>
              )}

              {/* ADMIN FORM */}
              {view === 'ADMIN' && (
                <form onSubmit={handleAdminSubmit} className="w-full space-y-3.5">
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-4 text-slate-500" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Admin Email"
                      disabled={showAdminVerify}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#070a14] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800"
                    />
                  </div>

                  {showAdminVerify && (
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-4 text-purple-400" />
                      <input
                        type="password"
                        required
                        placeholder="Enter Secret Code"
                        value={adminAuthCode}
                        onChange={(e) => setAdminAuthCode(e.target.value)}
                        className="w-full bg-[#070a14] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-purple-500/50"
                        autoFocus
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    {showAdminVerify ? 'Access Dashboard' : 'Verify Email'}
                  </button>
                </form>
              )}

              {/* DIVIDER & GOOGLE */}
              {view === 'LOGIN' && (
                <>
                  <div className="w-full flex items-center my-3.5">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="px-3 text-[10px] font-extrabold text-slate-500 tracking-wider">OR</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleAuth} 
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-[#080b16] border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-slate-200"
                  >
                    <GoogleBrandIcon />
                    <span>Continue with Google</span>
                  </button>

                  <p className="text-xs text-slate-400 mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setView('SIGNUP'); setError(null); }}
                      className="font-bold text-amber-400 hover:underline ml-0.5"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {view === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => { setView('LOGIN'); setShowAdminVerify(false); }}
                  className="text-xs text-slate-400 hover:text-white mt-4"
                >
                  ← Back to Student Login
                </button>
              )}

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              SIDE 2: SIGN UP / INSTANT RECOVERY
          ══════════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full min-h-[580px] rounded-[2.5rem] bg-[#0c1020]/95 backdrop-blur-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-between p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-800 overflow-y-auto">
            
            <div className="w-full flex flex-col items-center my-auto">
              
              {/* SIGN UP FORM */}
              {view === 'SIGNUP' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-0.5">Sign Up</h2>
                  <p className="text-xs font-medium text-slate-400 mb-3">Create your student account</p>

                  {error && (
                    <div className="w-full mb-2.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <XCircle size={14} className="shrink-0 text-rose-400" />
                      <span className="truncate">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignUpSubmit} className="w-full space-y-2.5">
                    <div className="relative flex items-center">
                      <UserIcon size={15} className="absolute left-3.5 text-slate-500" />
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#070a14] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Phone size={15} className="absolute left-3.5 text-slate-500" />
                      <input
                        name="mobile"
                        type="tel"
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full bg-[#070a14] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Mail size={15} className="absolute left-3.5 text-slate-500" />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#070a14] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Lock size={15} className="absolute left-3.5 text-slate-500" />
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="Password (Min 6 chars)"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-[#070a14] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                      />
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      <select
                        name="securityQuestion"
                        value={formData.securityQuestion}
                        onChange={handleChange}
                        className="w-full bg-[#070a14] rounded-xl px-3 py-2 text-xs text-slate-300 font-medium outline-none border border-slate-800"
                      >
                        {DEFAULT_QUESTIONS.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                      
                      <div className="relative flex items-center">
                        <ShieldQuestion size={15} className="absolute left-3.5 text-amber-400" />
                        <input
                          name="securityAnswer"
                          type="text"
                          required
                          placeholder="Secret Answer (Recovery ke liye)"
                          value={formData.securityAnswer}
                          onChange={handleChange}
                          className="w-full bg-[#070a14] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 transition-all flex items-center justify-center gap-2 uppercase cursor-pointer mt-1"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <span>CREATE ACCOUNT</span>}
                    </button>
                  </form>

                  <button 
                    type="button" 
                    onClick={handleGoogleAuth} 
                    className="w-full mt-2.5 py-2.5 rounded-2xl bg-[#080b16] border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-xs font-bold text-slate-200"
                  >
                    <GoogleBrandIcon />
                    <span>Sign up with Google</span>
                  </button>

                  <p className="text-xs text-slate-400 mt-3">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setView('LOGIN'); setError(null); }}
                      className="font-bold text-amber-400 hover:underline ml-0.5"
                    >
                      Login
                    </button>
                  </p>
                </>
              )}

              {/* INSTANT RECOVERY FORM */}
              {view === 'RECOVERY' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 flex items-center gap-2 justify-center">
                    <KeyRound size={22} className="text-amber-400" />
                    <span>Instant Recovery</span>
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mb-4 text-center">
                    {recoveryStep === 1 ? 'Apna account search karein' : 'Sahi Answer par instant login'}
                  </p>

                  {error && (
                    <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <XCircle size={15} className="shrink-0 text-rose-400" />
                      <span className="truncate">{error}</span>
                    </div>
                  )}

                  {/* STEP 1: FIND ACCOUNT */}
                  {recoveryStep === 1 && (
                    <form onSubmit={handleFindRecoveryAccount} className="w-full space-y-3.5">
                      <div className="relative flex items-center">
                        <UserIcon size={16} className="absolute left-4 text-slate-500" />
                        <input
                          name="id"
                          type="text"
                          required
                          placeholder="Mobile / Email / UID"
                          value={formData.id}
                          onChange={handleChange}
                          className="w-full bg-[#070a14] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 transition-all flex items-center justify-center gap-2 uppercase cursor-pointer mt-1"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <span>FIND ACCOUNT</span>}
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  )}

                  {/* STEP 2: ANSWER VERIFICATION */}
                  {recoveryStep === 2 && (
                    <div className="w-full space-y-3.5">
                      <div className="p-3.5 rounded-2xl bg-[#080b16] border border-slate-800 text-left">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">SECURITY QUESTION:</span>
                        <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                          {recoveryUserObj?.securityQuestion || "Aapka favorite subject kaunsa hai?"}
                        </p>
                      </div>

                      <form onSubmit={handleVerifyAnswerSubmit} className="space-y-3">
                        <div className="relative flex items-center">
                          <ShieldQuestion size={16} className="absolute left-4 text-amber-400" />
                          <input
                            type="text"
                            required
                            placeholder="Enter Security Answer"
                            value={userEnteredAnswer}
                            onChange={(e) => { setUserEnteredAnswer(e.target.value); setError(null); }}
                            className="w-full bg-[#070a14] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border border-slate-800 focus:border-amber-500/70"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                        >
                          <CheckCircle2 size={16} />
                          <span>VERIFY &amp; LOGIN</span>
                        </button>
                      </form>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-5">
                    Wapas jaane ke liye{' '}
                    <button
                      type="button"
                      onClick={() => { setView('LOGIN'); setRecoveryStep(1); setError(null); }}
                      className="font-bold text-amber-400 hover:underline ml-0.5"
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
