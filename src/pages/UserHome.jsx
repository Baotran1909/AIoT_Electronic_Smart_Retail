import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Terminal, Database, BellRing, Mic, Star, CheckCircle2,
  ShieldCheck, Zap, Sparkles, X, Lock
} from 'lucide-react';

import Login from './Login';

const UserHome = ({ setUserRole }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf5ff] font-sans text-[#4a3e56] selection:bg-purple-200">

      {/* NAVBAR */}
      <nav className="fixed top-[25px] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[1100px]">
        <div className={`flex items-center justify-between px-8 py-3 bg-white rounded-full transition-all duration-500 border border-white/50 ${
          isScrolled
            ? 'shadow-[0_20px_50px_rgba(157,80,187,0.15)] -translate-y-1'
            : 'shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Cpu className="text-[#9d50bb]" size={24} />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-[#2c7a3c] uppercase">
              AIoT Retail
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['AI tư vấn', 'Kho linh kiện', 'Smart Locker', 'Quản trị realtime'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-black text-[#7f8c8d] hover:text-[#9d50bb] transition-colors uppercase tracking-widest"
              >
                {item}
              </a>
            ))}
          </div>

          <button
            onClick={() => setShowLogin(true)}
            className="bg-[#1545a1] text-white px-8 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Đăng nhập
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="pt-48 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-purple-50">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              Đồ án tốt nghiệp: AIoT Smart Retail
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 leading-[1.05] tracking-tight text-[#31263e]">
              Mua linh kiện thông minh.<br />
              <span className="bg-gradient-to-r from-[#9d50bb] to-[#f06292] bg-clip-text text-transparent">
                Nhận hàng qua Smart Locker.
              </span>
            </h1>

            <p className="text-xl text-slate-500 mb-12 max-w-lg font-medium leading-relaxed">
              Nền tảng tích hợp <b>AI tư vấn linh kiện</b>, quản lý kho realtime,
              thông báo Email/SMS và <b>ESP32 Smart Locker</b> để hỗ trợ quy trình
              mua hàng tự động trong hệ thống bán linh kiện điện tử.
            </p>

            <div className="flex flex-wrap gap-5 mb-24">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-br from-[#9d50bb] to-[#f06292] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_20px_40px_rgba(157,80,187,0.25)] hover:translate-y-[-4px] transition-all"
              >
                Trải nghiệm hệ thống
              </button>

              <button
                onClick={() => setUserRole('guest')}
                className="flex items-center gap-3 font-black text-slate-400 hover:text-[#9d50bb] transition-all group uppercase text-sm tracking-widest"
              >
                Xem giao diện khách
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-purple-50 group-hover:scale-110 transition-transform">
                  <Terminal size={16} className="text-[#f06292]" />
                </div>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { val: 'AI', label: 'Tư vấn linh kiện' },
                { val: 'IoT', label: 'ESP32 Locker' },
                { val: 'RTDB', label: 'Firebase Sync' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border-b-4 border-purple-100 text-center"
                >
                  <span className="block text-xl font-black text-[#9d50bb]">
                    {stat.val}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT ANIMATION */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-[480px] h-[480px] border-[1.5px] border-dashed border-purple-200 rounded-full flex items-center justify-center">

              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white pl-6 pr-8 py-4 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex items-center gap-3 z-30 border-l-[6px] border-[#f06292]">
                <Mic size={20} className="text-[#9d50bb]" />
                <span className="font-black text-slate-700 text-[15px] whitespace-nowrap uppercase tracking-tighter">
                  AI Shopping Assistant
                </span>
              </div>

              <div className="w-[350px] h-[350px] rounded-full overflow-hidden border-[12px] border-white shadow-[0_40px_80px_rgba(157,80,187,0.18)] bg-white z-10 flex items-center justify-center">
                <div className="text-center p-10">
                  <Cpu size={80} className="mx-auto text-purple-600 mb-4 animate-pulse" />
                  <h4 className="font-black text-slate-800 text-xl">ESP32 CORE</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Smart Locker Controller
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-25px] border-2 border-dashed border-pink-100/50 rounded-full"
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 z-20"
              >
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border-l-4 border-[#9d50bb]">
                  <Database size={14} className="text-purple-600" />
                  <span className="font-black text-[10px] text-slate-700 whitespace-nowrap uppercase tracking-widest">
                    Firebase Realtime
                  </span>
                </div>

                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border-l-4 border-[#f06292]">
                  <BellRing size={14} className="text-pink-600" />
                  <span className="font-black text-[10px] text-slate-700 whitespace-nowrap uppercase tracking-widest">
                    Email / SMS
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* TECHNOLOGY SECTION */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="bg-gradient-to-r from-[#9d50bb] to-[#f06292] bg-clip-text text-transparent font-black uppercase tracking-[0.3em] text-[10px]">
            Kiến trúc phần mềm và phần cứng
          </span>
          <h2 className="text-4xl lg:text-5xl mt-4 font-extrabold text-[#31263e]">
            Nền tảng AIoT Smart Retail
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-[3rem] p-6 shadow-[0_15px_40px_rgba(157,80,187,0.03)] border border-purple-50">
            <h3 className="text-4xl font-extrabold bg-gradient-to-r from-[#9d50bb] to-[#f06292] bg-clip-text text-transparent mb-8">
              AI Agent tư vấn linh kiện
            </h3>

            <p className="text-slate-500 mb-6 text-xl leading-relaxed font-medium">
              Trợ lý AI hỗ trợ người dùng tìm kiếm linh kiện, gợi ý sản phẩm phù hợp
              theo nhu cầu dự án, kiểm tra tương thích và hỗ trợ so sánh kỹ thuật.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Tư vấn linh kiện theo yêu cầu dự án',
                'Gợi ý sản phẩm liên quan',
                'So sánh thông số kỹ thuật',
                'Hỗ trợ khách hàng bằng hội thoại AI'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 font-bold text-slate-600 text-sm">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#9d50bb] to-[#673ab7] rounded-[3rem] p-6 text-white flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-6">
              ESP32 Smart Locker
            </h3>
            <p className="opacity-80 text-lg leading-relaxed font-medium mb-6">
              Điều khiển LCD 20x4, Keypad 4x4, PCA9685 và 4 Servo để mở tủ bằng mã PIN nhận hàng.
            </p>
            <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase">
              <Zap size={14} className="text-yellow-400" />
              PWM Servo Control
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-[#fdf2ff] rounded-[3rem] p-6 flex flex-col items-center justify-center text-center">
            <Database size={80} className="text-purple-200 mb-4" />
            <h4 className="font-black text-[#9d50bb] uppercase tracking-widest">
              Firebase Realtime
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">
              Đồng bộ đơn hàng, kho và locker
            </span>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white rounded-[3rem] p-6 shadow-[0_15px_40px_rgba(157,80,187,0.03)] border border-purple-50 flex items-center gap-10">
            <div className="hidden md:block">
              <BellRing size={100} className="text-pink-100" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">
                Thông báo đa kênh
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Hệ thống gửi <b>Email xác nhận đơn hàng</b> và <b>SMS thông báo nhận hàng</b>
                khi đơn sẵn sàng tại quầy hoặc Smart Locker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OPERATION FLOW */}
      <section className="bg-[#1a0f35] py-32 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl lg:text-6xl font-black mb-24 leading-tight">
            Luồng vận hành hệ thống<br />
            <span className="text-pink-400">Web - AI - Firebase - Smart Locker</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
            <div className="bg-white/5 h-[500px] rounded-[3rem] border border-white/10 flex items-center justify-center relative group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute w-64 h-64 border-2 border-dashed border-pink-400/30 rounded-full"
              />

              <div className="text-center z-10">
                <Mic size={80} className="mx-auto text-pink-400 mb-4" />
                <p className="font-black text-xl uppercase tracking-widest">
                  AI Interaction
                </p>
              </div>

              <p className="absolute bottom-10 font-bold text-slate-400 uppercase text-xs tracking-widest">
                AI tư vấn và xử lý yêu cầu người dùng
              </p>
            </div>

            <div>
              <span className="text-pink-400 font-black text-sm tracking-widest uppercase block mb-6">
                Giai đoạn 1 — Tư vấn và đặt hàng
              </span>

              <h3 className="text-4xl font-bold mb-8">
                Người dùng chọn linh kiện
              </h3>

              <p className="text-purple-100/60 text-lg leading-relaxed mb-8">
                Người dùng tìm kiếm sản phẩm, hỏi AI, thêm vào giỏ hàng và chọn phương thức nhận hàng:
                tại quầy, giao hàng hoặc Smart Locker.
              </p>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 inline-block">
                <span className="block text-xl font-black text-pink-400 uppercase tracking-tighter">
                  Realtime Sync
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Firebase cập nhật đơn hàng tức thời
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="md:order-2 bg-gradient-to-br from-purple-900/20 to-pink-900/20 h-[500px] rounded-[3rem] border border-white/10 flex items-center justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-[3rem]"
                />

                <div className="w-48 h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                    Smart Locker PIN
                  </span>
                  <span className="text-5xl font-black text-pink-400 tracking-tighter">
                    881004
                  </span>
                </div>
              </div>
            </div>

            <div className="md:order-1">
              <span className="text-pink-400 font-black text-sm tracking-widest uppercase block mb-6">
                Giai đoạn 2 — Nhận hàng qua Locker
              </span>

              <h3 className="text-4xl font-bold mb-8">
                Xác thực mã PIN trên ESP32
              </h3>

              <p className="text-purple-100/60 text-lg leading-relaxed mb-8">
                Khi Admin bỏ hàng vào tủ, hệ thống gửi mã PIN qua Email/SMS.
                Người dùng nhập mã trên Keypad để ESP32 kiểm tra Firebase và mở đúng ô tủ.
              </p>

              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 text-slate-300 text-xs font-mono uppercase">
                &gt; CHECK PIN → OPEN SERVO → UPDATE LOCKER STATUS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEST RESULT */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl font-black mb-24 tracking-tighter text-[#31263e]">
            Kết quả thực nghiệm và kiểm thử
          </h2>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                title: 'Đồng bộ realtime',
                subtitle: 'Firebase RTDB',
                text: 'Đơn hàng, tồn kho và trạng thái locker được cập nhật tức thời giữa Web Admin, Web User và ESP32.'
              },
              {
                title: 'Điều khiển Smart Locker',
                subtitle: 'ESP32 + Servo',
                text: 'ESP32 xác thực mã PIN, điều khiển Servo mở tủ và tự động cập nhật trạng thái mở/đóng lên Firebase.'
              },
              {
                title: 'Thông báo khách hàng',
                subtitle: 'EmailJS / eSMS',
                text: 'Khách hàng nhận email xác nhận đơn hàng và SMS thông báo khi đơn đã sẵn sàng để nhận.'
              }
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-[3rem] border-2 border-transparent hover:border-purple-200 transition-all shadow-sm"
              >
                <div className="flex gap-1 text-pink-400 mb-6 text-xl">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} size={18} fill="currentColor" />
                  ))}
                </div>

                <h4 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tighter">
                  {t.title}
                </h4>

                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6">
                  {t.subtitle}
                </p>

                <p className="italic text-slate-500 text-sm leading-relaxed font-medium">
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f0a24] text-white/30 py-24 px-6 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-16 border-b border-white/5 pb-24">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="text-purple-400" size={32} />
              <span className="bg-gradient-to-r from-[#9d50bb] to-[#f06292] bg-clip-text text-transparent font-black text-xl tracking-tighter uppercase">
                AIoT Retail
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs font-medium uppercase tracking-widest">
              Đề tài nghiên cứu ứng dụng AIoT trong hệ thống bán linh kiện và Smart Locker.
            </p>
          </div>

          <div>
            <h4 className="text-white/80 font-black mb-8 text-xs uppercase tracking-[0.3em]">
              Công nghệ Web
            </h4>
            <ul className="text-[10px] space-y-4 font-black uppercase tracking-widest">
              <li>ReactJS</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion</li>
              <li>Firebase RTDB</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white/80 font-black mb-8 text-xs uppercase tracking-[0.3em]">
              Hệ thống AI
            </h4>
            <ul className="text-[10px] space-y-4 font-black uppercase tracking-widest">
              <li>AI Assistant</li>
              <li>RAG / Vector Search</li>
              <li>Inventory Analysis</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white/80 font-black mb-8 text-xs uppercase tracking-[0.3em]">
              Hạ tầng IoT
            </h4>
            <ul className="text-[10px] space-y-4 font-black uppercase tracking-widest">
              <li>ESP32</li>
              <li>LCD 20x4</li>
              <li>Keypad 4x4</li>
              <li>PCA9685 Servo</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 text-[10px] uppercase font-black tracking-[0.4em] flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2026 Đồ án tốt nghiệp - AIoT Retail</p>
          <div className="flex items-center gap-2">
            Developed by Tran & Hai
            <span className="text-pink-500 animate-pulse text-sm">❤</span>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-[#0f0a24]/60 backdrop-blur-lg"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl p-6"
            >
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1 pr-8">
                  <h2 className="text-xl font-black text-[#31263e] tracking-tighter uppercase">
                    Đăng nhập AIoT Retail
                  </h2>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Truy cập hệ thống mua linh kiện, AI tư vấn và Smart Locker
                  </p>
                </div>

                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                  <ShieldCheck size={24} />
                </div>
              </div>

              <Login
                onLogin={(role) => {
                  setUserRole(role);
                  setShowLogin(false);
                }}
              />

              <button
                onClick={() => setShowLogin(false)}
                className="w-full mt-8 text-slate-400 font-bold hover:text-[#9d50bb] text-[10px] transition-colors uppercase tracking-[0.3em]"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI FLOATING BUTTON */}
      <button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-[#9d50bb] to-[#f06292] rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(157,80,187,0.4)] cursor-pointer hover:scale-110 transition-transform z-40 group"
      >
        <Sparkles size={28} className="group-hover:animate-spin" />
      </button>
    </div>
  );
};

export default UserHome;