import React from 'react';
import { ShoppingCart, Bell, User } from 'lucide-react';

const Navbar = ({ queueNumber, cartCount }) => {
  return (
    <nav className="flex justify-between items-center py-6 px-8 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700">
      {/* Tên dự án */}
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AI-IOT RETAIL
        </h1>
        {/* TÍNH NĂNG 4: SỐ THỨ TỰ */}
        <p className="text-xs text-slate-400 font-medium">
          SỐ THỨ TỰ CỦA BẠN: <span className="text-cyan-400 font-bold">#{queueNumber}</span>
        </p>
      </div>

      {/* Các biểu tượng tương tác */}
      <div className="flex gap-6 items-center">
        {/* Chuông thông báo - Sau này sẽ nháy đỏ nếu Admin báo cháy */}
        <div className="relative cursor-pointer hover:scale-110 transition-transform">
          <Bell size={24} className="text-slate-300" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
        </div>

        {/* Giỏ hàng */}
        <div className="relative cursor-pointer hover:scale-110 transition-transform bg-cyan-600/20 p-2 rounded-xl border border-cyan-500/30">
          <ShoppingCart size={24} className="text-cyan-400" />
          <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        </div>

        {/* User profile */}
        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-slate-600">
          <User size={20} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;