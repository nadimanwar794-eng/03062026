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

  // School Selection States
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchoolForJoin, setSelectedSchoolForJoin] = useState<SchoolType | null>(null);
  const [lockCodeInput, setLockCodeInput] = useState('');
  const [lockCodeError, setLockCodeError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

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
      const updated = { 
        ...pendingLoginUser, 
        id: pendingLoginUser.id || pendingLoginUser.uid,
        uid: pendingLoginUser.id || pendingLoginUser.uid,
        schoolId: school.id, 
        schoolName: school.name,
        profileCompleted: true
      };
      localStorage.setItem('nst_current_user', JSON.stringify(updated));
      localStorage.setItem('nst_last_user_id', updated.id);
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

  const triggerLoginSuccess = (user: User) => {
    const validId = user.id || user.uid;
    const safeUser = {
      ...user,
      id: validId,
      uid: validId,
      profileCompleted: true
    };
    onLogin(safeUser);
  };

  // 100% RELIABLE GOOGLE AUTH
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userEmail = (firebaseUser.email || '').trim().toLowerCase();
      const userDisplayName = firebaseUser.displayName || 'Student';
      const userPhoto = firebaseUser.photoURL || '';
      const userMobile = firebaseUser.phoneNumber || '';
      const uid = firebaseUser.uid;

      let appUser: any = await getUserData(uid);

      if (!appUser && userEmail) {
        appUser = await getUserByEmail(userEmail);
      }

      if (!appUser) {
        appUser = await getUserByLinkedGoogleUid(uid);
      }

      if (appUser) {
        appUser = {
          ...appUser,
          id: uid,
          uid: uid,
          email: appUser.email || userEmail,
          name: appUser.name || userDisplayName,
          provider: 'google',
          photoURL: userPhoto || appUser.photoURL,
          profileCompleted: true,
          securityQuestion: appUser.securityQuestion || DEFAULT_QUESTIONS[0],
          securityAnswer: appUser.securityAnswer || 'google',
          credits: typeof appUser.credits === 'number' && appUser.credits > 0 ? appUser.credits : 50
        };

        localStorage.setItem('nst_current_user', JSON.stringify(appUser));
        localStorage.setItem('nst_last_user_id', uid);
        await saveUserToLive(appUser);

        if (logActivity) logActivity("LOGIN", "Student Logged In via Google Auth", appUser);
        triggerLoginSuccess(appUser);
      } else {
        const newId = generateUserId();
        const signupCoins = (settings && typeof settings.signupBonus === 'number') ? settings.signupBonus : (appSettings?.signupBonus || 50);

        const newUser: User = {
          id: uid,
          uid: uid,
          displayId: newId,
          name: userDisplayName,
          email: userEmail,
          password: '',
          mobile: userMobile,
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
          credits: signupCoins,
          streak: 1,
          totalScore: 0,
          lastLoginDate: new Date().toISOString(),
          board: 'CBSE',
          classLevel: '10',
          provider: 'google',
          photoURL: userPhoto,
          avatarChoice: userPhoto ? 'gmail' : 'app',
          profileCompleted: true,
          securityQuestion: DEFAULT_QUESTIONS[0],
          securityAnswer: 'google',
          progress: {},
          redeemedCodes: [],
          subscriptionTier: 'FREE',
          isPremium: false,
          inbox: [
            {
              id: `welcome-bonus-${Date.now()}`,
              text: `🎉 Welcome to IIC! Aapko ${signupCoins} Welcome Credits mil gaye hain.`,
              date: new Date().toISOString(),
              read: false,
              type: 'GIFT',
              gift: { type: 'CREDITS', value: signupCoins },
              isClaimed: true
            }
          ]
        };

        localStorage.setItem('nst_current_user', JSON.stringify(newUser));
        localStorage.setItem('nst_last_user_id', uid);
        await saveUserToLive(newUser);

        if (logActivity) logActivity("SIGNUP_GOOGLE", "New Student Registered via Google", newUser);
        triggerLoginSuccess(newUser);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in window band kar di gayi.");
      } else {
        setError(err.message || "Google Login fail hua. Details check karein.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Unified Login Handler (Fixed to retain UID, email, & security Q/A)
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

      // Email Path
      if (input.includes('@')) {
        try {
          const res = await signInWithEmailAndPassword(auth, input.toLowerCase(), pass);
          const uid = res.user.uid;
          
          let appUser: any = await getUserData(uid);
          if (!appUser) {
            appUser = await getUserByEmail(input.toLowerCase());
          }

          const completeUser: User = {
            ...(appUser || {}),
            id: uid,
            uid: uid,
            email: appUser?.email || input.toLowerCase(),
            name: appUser?.name || res.user.displayName || "Student",
            mobile: appUser?.mobile || "",
            role: appUser?.role || "STUDENT",
            securityQuestion: appUser?.securityQuestion || DEFAULT_QUESTIONS[0],
            securityAnswer: appUser?.securityAnswer || "",
            board: appUser?.board || "CBSE",
            classLevel: appUser?.classLevel || "10",
            credits: appUser?.credits ?? 50,
            streak: appUser?.streak ?? 1,
            totalScore: appUser?.totalScore ?? 0,
            profileCompleted: true
          };

          localStorage.setItem('nst_current_user', JSON.stringify(completeUser));
          localStorage.setItem('nst_last_user_id', uid);
          await saveUserToLive(completeUser);

          if (logActivity) logActivity("LOGIN", "Student Logged In via Email", completeUser);
          triggerLoginSuccess(completeUser);
          return;
        } catch (e: any) {
          if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            setError("Galat password. Dobara check karein.");
            setLoading(false);
            return;
          }
        }
      }

      // Anonymous fallback for lookup
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch {}

      // Mobile or Account ID Path
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
          const raw = freshProfile || targetUser;
          const uid = raw.id || raw.uid;

          const finalUser: User = {
            ...raw,
            id: uid,
            uid: uid,
            email: raw.email || "",
            mobile: raw.mobile || "",
            securityQuestion: raw.securityQuestion || DEFAULT_QUESTIONS[0],
            securityAnswer: raw.securityAnswer || "",
            profileCompleted: true
          };

          localStorage.setItem('nst_current_user', JSON.stringify(finalUser));
          localStorage.setItem('nst_last_user_id', uid);
          await saveUserToLive(finalUser);

          if (logActivity) logActivity("LOGIN", "Student Logged In via Mobile/UID", finalUser);
          triggerLoginSuccess(finalUser);

          if (finalUser.email) {
            signInWithEmailAndPassword(auth, finalUser.email, pass).catch(() => {});
          }
          return;
        }

        if (isGoogleUser) {
          setError("Yeh account Google se bana hai. 'Google Sign-in' button use karein.");
          setLoading(false);
          return;
        }

        setError("Galat Password! Sahi password enter karein.");
        setLoading(false);
        return;
      }

      setError("Account nahi mila. Mobile number, UID ya Email check karein.");
    } catch (err: any) {
      setError(err.message || "Login fail hua. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler (Fixed Data Sync)
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
      const uid = res.user.uid;
      const newId = generateUserId();
      const signupCoins = (settings && typeof settings.signupBonus === 'number') ? settings.signupBonus : (appSettings?.signupBonus || 50);

      const newStudentUser: User = {
        id: uid,
        uid: uid,
        displayId: newId,
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password: cleanPassword,
        securityQuestion: formData.securityQuestion,
        securityAnswer: cleanAnswer,
        role: 'STUDENT',
        createdAt: new Date().toISOString(),
        credits: signupCoins,
        streak: 1,
        totalScore: 0,
        lastLoginDate: new Date().toISOString(),
        board: 'CBSE',
        classLevel: '10',
        provider: 'email',
        profileCompleted: true,
        progress: {},
        redeemedCodes: [],
        subscriptionTier: 'FREE',
        isPremium: false,
        inbox: [
          {
            id: `welcome-bonus-${Date.now()}`,
            text: `🎉 Welcome to IIC! Aapko ${signupCoins} Welcome Credits mil gaye hain.`,
            date: new Date().toISOString(),
            read: false,
            type: 'GIFT',
            gift: { type: 'CREDITS', value: signupCoins },
            isClaimed: true
          }
        ]
      };

      localStorage.setItem('nst_current_user', JSON.stringify(newStudentUser));
      localStorage.setItem('nst_last_user_id', uid);
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
      const raw = freshProfile || recoveryUserObj;
      const uid = raw.id || raw.uid;

      const finalUser: User = {
        ...raw,
        id: uid,
        uid: uid,
        profileCompleted: true
      };

      localStorage.setItem('nst_current_user', JSON.stringify(finalUser));
      localStorage.setItem('nst_last_user_id', uid);
      await saveUserToLive(finalUser);

      if (logActivity) logActivity("INSTANT_SECURITY_LOGIN", "Instant login via Security Answer", finalUser);
      setLoading(false);
      triggerLoginSuccess(finalUser);
    } else {
      setError("Galat Answer! Sahi answer likhein.");
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
            adminUser = { ...adminUser, id: cred.user.uid, uid: cred.user.uid, lastLoginDate: new Date().toISOString(), isPremium: true, subscriptionTier: 'LIFETIME', subscriptionLevel: 'ULTRA', profileCompleted: true };
          } else {
            adminUser = {
              id: cred.user.uid, uid: cred.user.uid, displayId: 'IIC-ADMIN', name: 'Administrator', email: formData.email, password: '', mobile: 'ADMIN', role: 'ADMIN',
              createdAt: new Date().toISOString(), credits: 99999, streak: 999, lastLoginDate: new Date().toISOString(),
              board: 'CBSE', classLevel: '12', progress: {}, redeemedCodes: [], isPremium: true, subscriptionTier: 'LIFETIME', subscriptionLevel: 'ULTRA', profileCompleted: true
            };
          }
          localStorage.setItem('nst_current_user', JSON.stringify(adminUser));
          localStorage.setItem('nst_last_user_id', adminUser.id);
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
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );

  // School Selection Step
  if (view === 'SCHOOL_SELECT') {
    const filteredSchools = schools.filter(sc =>
      sc.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      (sc.address || '').toLowerCase().includes(schoolSearch.toLowerCase())
    );

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#eef1f5] px-4 font-sans select-none py-8">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-[2.5rem] bg-[#eef1f5] shadow-[20px_20px_60px_#caced5,-20px_-20px_60px_#ffffff] text-center border border-white/60">
          <div className="w-14 h-14 bg-[#eef1f5] text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff]">
            <School size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">Apna School Select Karein</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-5">Apne school ka content access karne ke liye select karein.</p>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="School search karein..."
              value={schoolSearch}
              onChange={e => setSchoolSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium bg-[#eef1f5] text-slate-800 placeholder-slate-400 outline-none shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff]"
            />
          </div>

          {selectedSchoolForJoin && (
            <div className="mb-4 p-4 bg-[#eef1f5] shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff] rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock size={16} className="text-amber-600" />
                <p className="text-sm font-bold text-slate-800">{selectedSchoolForJoin.name}</p>
              </div>
              <p className="text-xs text-slate-500 mb-3">Is school me join karne ke liye secret lock code dalein.</p>
              <input
                type="text"
                placeholder="Lock Code"
                value={lockCodeInput}
                onChange={e => { setLockCodeInput(e.target.value); setLockCodeError(''); }}
                className="w-full px-3 py-2.5 bg-[#eef1f5] rounded-xl text-xs font-bold text-slate-800 mb-2 outline-none shadow-[inset_2px_2px_5px_#caced5,inset_-2px_-2px_5px_#ffffff]"
              />
              {lockCodeError && <p className="text-xs text-rose-500 font-bold mb-2">{lockCodeError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSchoolForJoin(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-[3px_3px_6px_#caced5,-3px_-3px_6px_#ffffff]"
                >Cancel</button>
                <button
                  type="button"
                  onClick={() => confirmSchoolJoin(selectedSchoolForJoin, lockCodeInput)}
                  disabled={verifyingCode}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-white text-xs font-black shadow-md"
                >{verifyingCode ? 'Verifying...' : 'Join School'}</button>
              </div>
            </div>
          )}

          {loadingSchools ? (
            <div className="py-8 text-slate-400 text-xs font-semibold">Loading schools...</div>
          ) : filteredSchools.length === 0 ? (
            <div className="py-8 text-slate-400 text-xs font-semibold">
              {schoolSearch ? 'Koi school nahi mila.' : 'Abhi koi school listed nahi hai.'}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredSchools.map(sc => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSchoolSelect(sc)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#eef1f5] shadow-[4px_4px_8px_#caced5,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1f5] shadow-[inset_2px_2px_4px_#caced5,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center shrink-0">
                    {sc.logoUrl ? (
                      <img src={sc.logoUrl} alt={sc.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <School size={18} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{sc.name}</p>
                    {sc.address && <p className="text-[11px] text-slate-500 truncate">{sc.address}</p>}
                  </div>
                  {sc.lockCodeActive && <Lock size={13} className="text-amber-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={skipSchoolSelect}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#eef1f5] px-4 select-none">
        <div className="w-full max-w-md p-8 rounded-[2.5rem] bg-[#eef1f5] shadow-[20px_20px_60px_#caced5,-20px_-20px_60px_#ffffff] border border-white/60 text-center">
          <div className="w-16 h-16 bg-[#eef1f5] text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff]">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">Account Created!</h2>
          <p className="text-xs text-slate-500 mb-5">Aapka unique student login ID:</p>
          <div className="p-4 rounded-2xl bg-[#eef1f5] shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff] text-2xl font-mono font-black text-emerald-600 mb-6 flex items-center justify-center gap-3">
            <span>{generatedId}</span>
            <button type="button" onClick={handleCopyId} className="text-slate-400 hover:text-slate-700 p-1">
              {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (pendingLoginUser) triggerLoginSuccess(pendingLoginUser);
              else setView('LOGIN');
            }}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[6px_6px_14px_#caced5,-6px_-6px_14px_#ffffff] active:scale-[0.98] transition-all"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#eef1f5] text-slate-800 px-4 py-6 select-none font-sans overflow-x-hidden relative">

      <CustomAlert 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        onClose={() => {
          setAlertConfig({ ...alertConfig, isOpen: false });
          if (pendingLoginUser) onLogin(pendingLoginUser);
        }} 
      />

      {showGuide && <LoginGuide onClose={() => setShowGuide(false)} />}

      {/* TOP HEADER */}
      <header className="w-full max-w-md flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md p-1 border border-amber-400/40">
            {settings?.appLogo ? (
              <img src={settings.appLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <span className="text-xs font-black text-amber-400">{settings?.appShortName || 'IIC'}</span>
            )}
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">{settings?.appName || 'IIC'}</h1>
        </div>

        <button 
          type="button"
          onClick={() => setShowGuide(true)} 
          className="w-8 h-8 rounded-full bg-[#eef1f5] shadow-[3px_3px_6px_#caced5,-3px_-3px_6px_#ffffff] flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <HelpCircle size={17} />
        </button>
      </header>

      {/* ── NEUMORPHIC CARD CONTAINER ── */}
      <div className="w-full max-w-[390px] my-auto">
        <div className="w-full rounded-[2.5rem] bg-[#eef1f5] shadow-[20px_20px_50px_#caced5,-20px_-20px_50px_#ffffff] border border-white/60 p-7 sm:p-8 flex flex-col items-center">
          
          {/* LOGIN VIEW */}
          {view === 'LOGIN' && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1 text-center">Login</h2>
              <p className="text-xs font-medium text-slate-400 mb-6 text-center">Sign in to your account</p>

              {error && (
                <div className="w-full mb-4 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <XCircle size={15} className="shrink-0 text-rose-500" />
                  <span className="truncate">{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
                <div className="relative flex items-center">
                  <UserIcon size={16} className="absolute left-4 text-slate-400" />
                  <input
                    name="id"
                    type="text"
                    required
                    placeholder="Mobile, Email ya Account ID"
                    value={formData.id}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium outline-none shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff]"
                    autoCapitalize="none"
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-2xl pl-11 pr-11 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium outline-none shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors shadow-inner flex items-center ${rememberMe ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                    <span className="text-slate-500 font-medium">Remember me</span>
                  </label>

                  <button 
                    type="button" 
                    onClick={() => { setView('RECOVERY'); setRecoveryStep(1); setError(null); }}
                    className="text-red-500 font-bold hover:underline transition-colors flex items-center gap-1.5"
                  >
                    <KeyRound size={13} className="text-red-500" />
                    <span>Instant Recovery</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-700 bg-[#eef1f5] shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] active:scale-[0.99] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer mt-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin text-slate-600" /> : <span>SIGN IN</span>}
                </button>
              </form>

              <button 
                type="button" 
                onClick={handleGoogleAuth} 
                disabled={loading}
                className="w-full mt-3.5 py-3 rounded-2xl bg-[#eef1f5] shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700"
              >
                <GoogleBrandIcon />
                <span>Google Sign-in</span>
              </button>

              <p className="text-xs text-slate-500 mt-5">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setView('SIGNUP'); setError(null); }}
                  className="font-bold text-red-500 hover:underline ml-0.5"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* SIGN UP VIEW */}
          {view === 'SIGNUP' && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1 text-center">Sign Up</h2>
              <p className="text-xs font-medium text-slate-400 mb-5 text-center">Create account & get 50 bonus credits</p>

              {error && (
                <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <XCircle size={14} className="shrink-0 text-rose-500" />
                  <span className="truncate">{error}</span>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="w-full space-y-3">
                <div className="relative flex items-center">
                  <UserIcon size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff]"
                  />
                </div>

                <div className="relative flex items-center">
                  <Phone size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    name="mobile"
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff]"
                  />
                </div>

                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff]"
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 text-slate-400" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Password (Min 6 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff]"
                  />
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <select
                    name="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={handleChange}
                    className="w-full bg-[#eef1f5] rounded-xl px-3 py-2 text-xs text-slate-700 font-medium outline-none shadow-[inset_2px_2px_5px_#caced5,inset_-2px_-2px_5px_#ffffff]"
                  >
                    {DEFAULT_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                  </select>
                  
                  <div className="relative flex items-center">
                    <ShieldQuestion size={15} className="absolute left-3.5 text-amber-600" />
                    <input
                      name="securityAnswer"
                      type="text"
                      required
                      placeholder="Secret Answer (Recovery ke liye)"
                      value={formData.securityAnswer}
                      onChange={handleChange}
                      className="w-full bg-[#eef1f5] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none shadow-[inset_2px_2px_5px_#caced5,inset_-2px_-2px_5px_#ffffff]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-800 bg-[#eef1f5] shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer mt-1"
                >
                  {loading ? <Loader2 size={16} className="animate-spin text-slate-600" /> : <span>CREATE ACCOUNT</span>}
                </button>
              </form>

              <p className="text-xs text-slate-500 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setView('LOGIN'); setError(null); }}
                  className="font-bold text-red-500 hover:underline ml-0.5"
                >
                  Login
                </button>
              </p>
            </div>
          )}

          {/* RECOVERY VIEW */}
          {view === 'RECOVERY' && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1 flex items-center gap-2 justify-center">
                <KeyRound size={22} className="text-red-500" />
                <span>Instant Recovery</span>
              </h2>
              <p className="text-xs font-medium text-slate-400 mb-5 text-center">
                {recoveryStep === 1 ? 'Apna account search karein' : 'Sahi answer se instant login'}
              </p>

              {error && (
                <div className="w-full mb-3 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <XCircle size={15} className="shrink-0 text-rose-500" />
                  <span className="truncate">{error}</span>
                </div>
              )}

              {recoveryStep === 1 && (
                <form onSubmit={handleFindRecoveryAccount} className="w-full space-y-4">
                  <div className="relative flex items-center">
                    <UserIcon size={16} className="absolute left-4 text-slate-400" />
                    <input
                      name="id"
                      type="text"
                      required
                      placeholder="Mobile / Email / UID"
                      value={formData.id}
                      onChange={handleChange}
                      className="w-full bg-[#eef1f5] rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-slate-800 bg-[#eef1f5] shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin text-slate-600" /> : <span>FIND ACCOUNT</span>}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {recoveryStep === 2 && (
                <div className="w-full space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#eef1f5] shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] text-left">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">SECURITY QUESTION:</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      {recoveryUserObj?.securityQuestion || "Aapka favorite subject kaunsa hai?"}
                    </p>
                  </div>

                  <form onSubmit={handleVerifyAnswerSubmit} className="space-y-3.5">
                    <div className="relative flex items-center">
                      <ShieldQuestion size={16} className="absolute left-4 text-amber-600" />
                      <input
                        type="text"
                        required
                        placeholder="Enter Security Answer"
                        value={userEnteredAnswer}
                        onChange={(e) => { setUserEnteredAnswer(e.target.value); setError(null); }}
                        className="w-full bg-[#eef1f5] rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none shadow-[inset_4px_4px_8px_#caced5,inset_-4px_-4px_8px_#ffffff]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider text-emerald-700 bg-[#eef1f5] shadow-[6px_6px_12px_#caced5,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#caced5,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>VERIFY &amp; LOGIN</span>
                    </button>
                  </form>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-5">
                Wapas jaane ke liye{' '}
                <button
                  type="button"
                  onClick={() => { setView('LOGIN'); setRecoveryStep(1); setError(null); }}
                  className="font-bold text-red-500 hover:underline ml-0.5"
                >
                  Login karein
                </button>
              </p>
            </div>
          )}

        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};

export default Auth;

