import React, { useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { Mail, Lock, User, MapPin, Phone, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAILS = [
  "admin@gmail.com",
  "haingocnguyen888@gmail.com"
];

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [signupError, setSignupError] = useState('');

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
    password: ''
  });

  const resolveRole = (userEmail) => {
    const normalizedEmail = userEmail?.toLowerCase() || "";
    return ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const role = resolveRole(user.email);

      sessionStorage.setItem("userEmail", user.email || "");
      sessionStorage.setItem("userDisplayName", user.displayName || "");
      sessionStorage.setItem("loginRole", role);

      onLogin(role);
    } catch (err) {
      console.error(err);
      setError("Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (
      !signupData.fullName ||
      !signupData.email ||
      !signupData.address ||
      !signupData.phone ||
      !signupData.password
    ) {
      setSignupError("Vui lòng nhập đầy đủ thông tin đăng ký!");
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      );

      await updateProfile(userCredential.user, {
        displayName: signupData.fullName
      });

      localStorage.setItem(
        `user_profile_${userCredential.user.uid}`,
        JSON.stringify({
          fullName: signupData.fullName,
          email: signupData.email,
          address: signupData.address,
          phone: signupData.phone
        })
      );

      setShowSignup(false);
      setEmail(signupData.email);
      setPassword('');
      setSignupData({
        fullName: '',
        email: '',
        address: '',
        phone: '',
        password: ''
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập để sử dụng hệ thống.");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setSignupError("Email này đã được đăng ký!");
      } else if (err.code === "auth/weak-password") {
        setSignupError("Mật khẩu phải có ít nhất 6 ký tự!");
      } else {
        setSignupError("Không thể đăng ký tài khoản. Vui lòng thử lại!");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.photoURL) {
        sessionStorage.setItem("userProfilePicture", user.photoURL);
      }

      const role = resolveRole(user.email);

      sessionStorage.setItem("isGoogleLogin", "true");
      sessionStorage.setItem("userEmail", user.email || "");
      sessionStorage.setItem("userDisplayName", user.displayName || "");
      sessionStorage.setItem("loginRole", role);

      onLogin(role);
    } catch (err) {
      console.error(err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Bạn đã đóng cửa sổ đăng nhập Google.");
      } else {
        setError("Không thể đăng nhập Google. Vui lòng kiểm tra cấu hình Firebase!");
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSignup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignup(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              className="relative w-full max-w-md max-h-[90vh] bg-white rounded-[2rem] shadow-2xl p-7 overflow-y-auto"
            >
              <button
                onClick={() => setShowSignup(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  Đăng ký khách hàng
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Tạo tài khoản để mua linh kiện và nhận hàng qua Smart Locker
                </p>
              </div>

              {signupError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 mb-4">
                  ⚠️ {signupError}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-3">
                <InputField icon={<User size={16} />} label="Họ và tên" placeholder="Nguyễn Văn A" value={signupData.fullName} onChange={(v) => setSignupData({ ...signupData, fullName: v })} />
                <InputField icon={<Mail size={16} />} label="Email" placeholder="user@example.com" value={signupData.email} onChange={(v) => setSignupData({ ...signupData, email: v })} type="email" />
                <InputField icon={<Phone size={16} />} label="Số điện thoại" placeholder="0901234567" value={signupData.phone} onChange={(v) => setSignupData({ ...signupData, phone: v })} type="tel" />
                <InputField icon={<MapPin size={16} />} label="Địa chỉ" placeholder="Địa chỉ nhận hàng nếu giao tận nơi" value={signupData.address} onChange={(v) => setSignupData({ ...signupData, address: v })} />
                <InputField icon={<Lock size={16} />} label="Mật khẩu" placeholder="Tối thiểu 6 ký tự" value={signupData.password} onChange={(v) => setSignupData({ ...signupData, password: v })} type="password" />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 mt-4"
                >
                  Tạo tài khoản
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md mx-auto space-y-5 text-left">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={<Mail size={18} />}
            label="Email"
            placeholder="Email người dùng hoặc quản trị viên"
            value={email}
            onChange={setEmail}
            type="email"
          />

          <InputField
            icon={<Lock size={18} />}
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={setPassword}
            type="password"
          />

          <button
            type="submit"
            className="w-full bg-[#0f172a] text-white py-2.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Đăng nhập hệ thống
          </button>
        </form>

        <div className="text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">
          hoặc
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border border-slate-200 py-2.5.5 rounded-xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Đăng nhập bằng Google
        </button>

        <div className="text-center text-slate-400 text-sm">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="text-blue-600 font-black hover:underline"
          >
            Đăng ký khách hàng
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs text-slate-500 leading-relaxed">
          <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-[10px] tracking-widest mb-2">
            <ShieldCheck size={14} />
            Phân quyền hệ thống
          </div>
          <p>
            Tài khoản quản trị được dùng để quản lý kho, đơn hàng, AI Inventory và Smart Locker.
            Tài khoản khách hàng dùng để mua linh kiện, nhận email/SMS và lấy hàng tại tủ thông minh.
          </p>
        </div>
      </div>
    </>
  );
};

const InputField = ({ icon, label, placeholder, value, onChange, type = "text" }) => {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
        <span className="text-slate-400 mr-2 flex-shrink-0">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-slate-700 text-sm font-medium"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default Login;