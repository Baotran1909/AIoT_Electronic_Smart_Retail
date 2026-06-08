import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserHome from './pages/UserHome';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard'; // Nhớ tạo file này ở Bước 2

function App() {
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  // Save user role to localStorage whenever it changes
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  // LOGIC ĐIỀU HƯỚNG PHÂN QUYỀN:
  
  // 1. Nếu là Admin -> Hiện trang Quản trị Xanh Lá
  if (userRole === 'admin') {
    return <AdminDashboard onLogout={() => setUserRole(null)} />;
  }

  // 2. Nếu là User -> Hiện trang Mua sắm Xanh Dương
  if (userRole === 'user') {
    return <UserDashboard onLogout={() => setUserRole(null)} isGuest={false} />;
  }

  // 2.5. Nếu là Guest -> Hiện trang Mua sắm ở chế độ khách
  if (userRole === 'guest') {
    return <UserDashboard onLogout={() => setUserRole(null)} isGuest={true} onLoginSuccess={() => setUserRole('user')} />;
  }

  // 3. Mặc định (Chưa đăng nhập) -> Hiện trang giới thiệu
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserHome setUserRole={setUserRole} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;