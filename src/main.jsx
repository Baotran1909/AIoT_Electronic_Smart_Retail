import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Import các giao diện của sếp
import UserHome from './pages/UserHome.jsx' 
import AdminDashboard from './pages/AdminDashboard.jsx'
import QueueDisplay from './pages/QueueDisplay.jsx'
import UserDashboard from './pages/UserDashboard.jsx'

const AppRoot = () => {
  const path = window.location.pathname;

  // Lấy quyền user từ bộ nhớ (để F5 không bị văng ra)
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  useEffect(() => {
    if (userRole) localStorage.setItem('userRole', userRole);
    else localStorage.removeItem('userRole');
  }, [userRole]);

  // 1. Luồng Tivi Gọi Số
  if (path === '/queue') return <QueueDisplay />;

  // 2. Logic Phân Quyền Thông Minh
  if (userRole === 'admin') {
    return <AdminDashboard onLogout={() => setUserRole(null)} />;
  }
  if (userRole === 'user') {
    return <UserDashboard isGuest={false} onLogout={() => setUserRole(null)} />;
  }
  if (userRole === 'guest') {
    return (
      <UserDashboard 
        isGuest={true} 
        onLogout={() => setUserRole(null)} 
        onLoginSuccess={() => setUserRole('user')} // Đăng nhập xong đổi từ Khách -> User
      />
    );
  }

  // 3. Mặc định -> Hiện trang AIOT Store tuyệt đẹp
  return <UserHome setUserRole={setUserRole} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>,
)