import React, { useState } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs, 
  updateDoc 
} from "firebase/firestore";

interface AuthProps {
  onLogin: (userData: any) => void;
  logActivity?: (action: string, details: string) => void;
  appSettings?: any;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, logActivity, appSettings }) => {
  const [view, setView] = useState<"login" | "signup" | "recovery">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  
  // Security Questions State
  const [securityQuestion, setSecurityQuestion] = useState("Aapka favorite subject kaunsa hai?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"find" | "answer" | "reset">("find");
  const [matchedUserDocId, setMatchedUserDocId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const auth = getAuth();
  const db = getFirestore();

  // 1. LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let loginEmail = identifier.trim();

      if (!loginEmail.includes("@")) {
        const usersRef = collection(db, "students");
        const q = query(usersRef, where("mobile", "==", loginEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          loginEmail = userData.email;
        } else {
          throw new Error("Is Mobile number se koi account nahi mila.");
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const uid = userCredential.user.uid;

      let userDoc = await getDoc(doc(db, "students", uid));
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, "users", uid));
      }

      const userData = userDoc.exists() ? userDoc.data() : {
        id: uid,
        uid: uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || "Student",
        role: "STUDENT",
        profileCompleted: true
      };

      const finalUser = {
        ...userData,
        id: userData.id || uid,
        uid: userData.uid || uid,
        email: userData.email || userCredential.user.email,
        profileCompleted: true
      };

      localStorage.setItem("nst_current_user", JSON.stringify(finalUser));
      localStorage.setItem("nst_last_user_id", uid);
      logActivity?.("LOGIN", `User logged in: ${finalUser.name}`);
      onLogin(finalUser);
    } catch (err: any) {
      setError(err.message || "Login fail ho gaya. Details check karein.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGNUP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, identifier.trim(), password);
      const uid = userCredential.user.uid;

      const newStudentData = {
        id: uid,
        uid: uid,
        displayId: uid.slice(0, 8).toUpperCase(),
        name: name.trim() || "Student",
        email: identifier.trim(),
        mobile: mobile.trim(),
        role: "STUDENT",
        board: "CBSE",
        classLevel: "10",
        isPremium: false,
        profileCompleted: true,
        securityQuestion,
        securityAnswer: securityAnswer.trim().toLowerCase(),
        credits: 50,
        streak: 1,
        totalScore: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "students", uid), newStudentData);
      await setDoc(doc(db, "users", uid), newStudentData);

      localStorage.setItem("nst_current_user", JSON.stringify(newStudentData));
      localStorage.setItem("nst_last_user_id", uid);
      logActivity?.("SIGNUP", `New student registered: ${newStudentData.name}`);
      onLogin(newStudentData);
    } catch (err: any) {
      setError(err.message || "Signup fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  // 3. GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const uid = firebaseUser.uid;

      const userDocRef = doc(db, "students", uid);
      const userSnap = await getDoc(userDocRef);

      let finalUserData: any;

      if (!userSnap.exists()) {
        finalUserData = {
          id: uid,
          uid: uid,
          displayId: uid.slice(0, 8).toUpperCase(),
          name: firebaseUser.displayName || "Student",
          email: firebaseUser.email || "",
          mobile: firebaseUser.phoneNumber || "",
          role: "STUDENT",
          board: "CBSE",
          classLevel: "10",
          isPremium: false,
          profileCompleted: true,
          credits: 50,
          streak: 1,
          totalScore: 0,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, finalUserData);
        await setDoc(doc(db, "users", uid), finalUserData);
      } else {
        const existingData = userSnap.data();
        finalUserData = {
          id: uid,
          uid: uid,
          ...existingData,
          email: existingData.email || firebaseUser.email,
          name: existingData.name || firebaseUser.displayName || "Student",
          profileCompleted: true,
        };
      }

      localStorage.setItem("nst_current_user", JSON.stringify(finalUserData));
      localStorage.setItem("nst_last_user_id", uid);
      logActivity?.("GOOGLE_LOGIN", `Google sign-in: ${finalUserData.name}`);
      onLogin(finalUserData);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Google Sign-In fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  // 4. INSTANT RECOVERY
  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const usersRef = collection(db, "students");
      let q = query(usersRef, where("email", "==", identifier.trim()));
      let snapshot = await getDocs(q);

      if (snapshot.empty) {
        q = query(usersRef, where("mobile", "==", identifier.trim()));
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        throw new Error("Is Email/Mobile se account nahi mila.");
      }

      const matchedDoc = snapshot.docs[0];
      const data = matchedDoc.data();

      setMatchedUserDocId(matchedDoc.id);
      setSecurityQuestion(data.securityQuestion || "Aapka favorite subject kaunsa hai?");
      setRecoveryStep("answer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!matchedUserDocId) return;
      const userDoc = await getDoc(doc(db, "students", matchedUserDocId));
      const data = userDoc.data();

      if (data?.securityAnswer?.trim().toLowerCase() === securityAnswer.trim().toLowerCase()) {
        setRecoveryStep("reset");
      } else {
        throw new Error("Galat answer! Dobara try karein.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!matchedUserDocId) return;
      await updateDoc(doc(db, "students", matchedUserDocId), {
        password: newPassword,
        updatedAt: new Date().toISOString()
      });
      setSuccessMsg("Password reset ho gaya! Ab login karein.");
      setTimeout(() => {
        setView("login");
        setRecoveryStep("find");
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Password update fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#16171b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">
        
        {/* Top Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center font-black text-slate-950 text-xl mb-3 shadow-lg shadow-amber-500/20">
            IIC
          </div>
          <h2 className="text-2xl font-black text-white">
            {view === "login" && "Welcome Back"}
            {view === "signup" && "Create Account"}
            {view === "recovery" && "Instant Recovery"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {view === "login" && "Sign in to access your study materials"}
            {view === "signup" && "Join IIC and start learning smartly"}
            {view === "recovery" && "Recover account using security question"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center font-semibold">
            {successMsg}
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">Email / Mobile Number</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="example@mail.com ya Mobile"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-400">Password</label>
                <button
                  type="button"
                  onClick={() => setView("recovery")}
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm disabled:opacity-50 mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        {/* SIGNUP VIEW */}
        {view === "signup" && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aapka Name"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit Mobile"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Security Question</label>
              <select
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Aapka favorite subject kaunsa hai?">Aapka favorite subject kaunsa hai?</option>
                <option value="Aapke bachpan ka school kaunsa tha?">Aapke bachpan ka school kaunsa tha?</option>
                <option value="Aapka favorite hero/sports person?">Aapka favorite hero/sports person?</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Security Answer</label>
              <input
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 text-sm disabled:opacity-50 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* INSTANT RECOVERY */}
        {view === "recovery" && (
          <div className="space-y-4">
            {recoveryStep === "find" && (
              <form onSubmit={handleFindAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">Registered Email ya Mobile</label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter Email or Phone"
                    className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-sm"
                >
                  {loading ? "Finding..." : "Find Account"}
                </button>
              </form>
            )}

            {recoveryStep === "answer" && (
              <form onSubmit={handleVerifyAnswer} className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  <strong>Question:</strong> {securityQuestion}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">Aapka Answer</label>
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Secret Answer"
                    className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-sm"
                >
                  {loading ? "Verifying..." : "Verify Answer"}
                </button>
              </form>
            )}

            {recoveryStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">Naya Password Set Karein</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full bg-[#0e0f11] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-sm"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Google Continue Button */}
        {view !== "recovery" && (
          <div className="mt-5">
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full"></div>
              <span className="bg-[#16171b] px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">OR</span>
              <div className="border-t border-white/10 w-full"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400 font-medium">
          {view === "login" ? (
            <>
              Account nahi hai?{" "}
              <button onClick={() => setView("signup")} className="text-amber-400 font-bold hover:underline">
                Register karein
              </button>
            </>
          ) : (
            <>
              Pehle se account hai?{" "}
              <button onClick={() => { setView("login"); setRecoveryStep("find"); }} className="text-amber-400 font-bold hover:underline">
                Sign In karein
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

