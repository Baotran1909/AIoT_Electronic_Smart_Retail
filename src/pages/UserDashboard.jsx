import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, ref, onValue, set, push, update, remove, serverTimestamp 
} from "firebase/database";
import { 
  getAuth, signInWithPopup, signOut 
} from "firebase/auth";
import { 
  LayoutDashboard, ShoppingCart, Mic, Search, LogOut, Cpu, 
  Package, X, Plus, TrendingUp, Bell, Settings, ArrowRight,
  MessageSquare, Play, Info, CreditCard, CheckCircle2, Minus, Star,
  Grid2x2, Zap, Smartphone, Bot, Lock, Trash2, 
  Phone, Banknote, Store, Box, Truck, MapPin, KeyRound, Ticket, 
  ChevronRight, ZapIcon, ShieldCheck, User, Menu, Heart, Filter, 
  Sparkles, GitCompare, ArrowLeftRight, Loader2, Moon, Sun, 
  BarChart3, Layers, Share2, Eye, Bookmark, History, Target, Code,
  CpuIcon, Wifi, Thermometer, Radio, Zap as VoltIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';



import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import emailjs from '@emailjs/browser';
import { db, googleProvider } from '../services/firebase';

// --- CONFIGURATION ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'smart-retail-hcmute';

const EMAILJS_PUBLIC_KEY = 'OtNOKGfht4flx5uQs';
const EMAILJS_SERVICE_ID = 'service_1cuk1gq';
const EMAILJS_TEMPLATE_ID = 'template_neell8j';

const FALLBACK_PRODUCTS = [
  { id: 'demo_esp32', name: 'ESP32 DevKit V1', category: 'Vi điều khiển', price: 125000, stock: 10, location: 'Khu A-01', image: 'https://picsum.photos/seed/esp32/300/300', description: 'Bo mạch ESP32 dùng cho IoT.' },
  { id: 'demo_rc522', name: 'Module RFID RC522', category: 'Module Rời', price: 35000, stock: 15, location: 'Khu B-02', image: 'https://picsum.photos/seed/rc522/300/300', description: 'Module RFID giao tiếp SPI.' },
  { id: 'demo_relay', name: 'Module Relay 1 kênh 5V', category: 'Module Rời', price: 18000, stock: 20, location: 'Khu C-01', image: 'https://picsum.photos/seed/relay/300/300', description: 'Relay điều khiển tải ngoài.' }
];

// --- DỮ LIỆU MẪU DỰ ÁN CỘNG ĐỒNG ---
const COMMUNITY_PROJECTS = [
  { id: 'proj1', title: 'Máy tưới cây tự động IoT', author: 'Minh Tech', likes: 142, parts: ['1', '2', '3'], image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=500', difficulty: 'Trung bình' },
  { id: 'proj2', title: 'Hệ thống Smart Home ESP32', author: 'Hoàng Dev', likes: 256, parts: ['1', '3'], image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=500', difficulty: 'Nâng cao' }
];

const App = ({ onLogout, isGuest = false, onLoginSuccess = null }) => {
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('Components');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('searchTerm') || '');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [showNotification, setShowNotification] = useState(null);

  // --- DATA STATES ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favs') || '[]'));
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [orderCount, setOrderCount] = useState(() => parseInt(localStorage.getItem('orderCount') || '0') + 1);
  const [orderHistory, setOrderHistory] = useState(() => {
    const stored = localStorage.getItem('orderHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [techPoints, setTechPoints] = useState(1250);

  // --- AI AGENT STATES ---
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);

  // --- CHECKOUT & AUTH STATES ---
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [category, setCategory] = useState('Vi điều khiển');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) return JSON.parse(saved);
    return { uid: "guest_" + Date.now(), displayName: "Khách hàng", rank: 'Thành viên mới' };
  });

  const chatEndRef = useRef(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // --- EFFECTS ---
  useEffect(() => {
    // Khởi tạo EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || user.email || "Khách hàng",
          photoURL: user.photoURL || sessionStorage.getItem('userProfilePicture') || `https://i.pravatar.cc/150?u=${user.uid}`,
          email: user.email,
          rank: 'Hạng Pro'
        });
        if (user.email) setCustomerEmail(user.email);
      }
    } catch (e) {
      console.warn('Không thể lấy thông tin auth hiện tại:', e);
    }

    const autoCategorize = (name) => {
      const lowerName = (name || '').toLowerCase();
      if (lowerName.includes('esp') || lowerName.includes('arduino') || lowerName.includes('stm32') || lowerName.includes('raspberry') || lowerName.includes('vi điều khiển')) return 'Vi điều khiển';
      if (lowerName.includes('cảm biến') || lowerName.includes('dht') || lowerName.includes('sr04') || lowerName.includes('mq-')) return 'Cảm biến';
      if (lowerName.includes('lcd') || lowerName.includes('màn hình') || lowerName.includes('oled') || lowerName.includes('led')) return 'Màn hình';
      if (lowerName.includes('relay') || lowerName.includes('module') || lowerName.includes('rfid') || lowerName.includes('rc522')) return 'Module Rời';
      if (lowerName.includes('pin') || lowerName.includes('dây') || lowerName.includes('breadboard') || lowerName.includes('nguồn')) return 'Phụ kiện';
      return 'Phụ kiện';
    };

    if (typeof db !== 'undefined' && db) {
      const productRef = ref(db, 'products');
      const unsubscribe = onValue(productRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => {
            const product = data[key];
            return {
              id: key,
              ...product,
              category: product.category || autoCategorize(product.name),
              stock: Number(product.stock || 0),
              price: Number(product.price || 0)
            };
          });
          setProducts(list);
        } else {
          setProducts([]);
        }
      });

      return () => unsubscribe();
    }

    setProducts(FALLBACK_PRODUCTS);
  }, []);

  useEffect(() => { localStorage.setItem('favs', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('searchTerm', searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => {

    const autoCategorize = (name) => {
      const lowerName = (name || '').toLowerCase();
      if (lowerName.includes('esp') || lowerName.includes('arduino') || lowerName.includes('mạch') || lowerName.includes('vi điều khiển')) return 'Vi điều khiển';
      if (lowerName.includes('cảm biến') || lowerName.includes('dht') || lowerName.includes('sr04')) return 'Cảm biến';
      if (lowerName.includes('relay') || lowerName.includes('module')) return 'Module Rời';
      if (lowerName.includes('lcd') || lowerName.includes('màn hình') || lowerName.includes('oled')) return 'Màn hình';
      return 'Phụ kiện'; // Nếu không khớp từ khóa nào thì vứt vào Phụ kiện
    };

    if (typeof db !== 'undefined' && db) {
      const productRef = ref(db, 'products');
      onValue(productRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => {
            const product = data[key];
            // NẾU FIREBASE KHÔNG CÓ CATEGORY, TRANG USER TỰ ĐỘNG GÁN
            const finalCategory = product.category ? product.category : autoCategorize(product.name);
            
            return { 
              id: key, 
              ...product,
              category: finalCategory // Cập nhật lại category
            };
          });
          setProducts(list);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      });
    } else {
      setProducts(FALLBACK_PRODUCTS);
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking, agentLogs]);

  // --- LOGIC HANDLERS ---
  const notify = (msg) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const buildCompactProductContext = (sourceProducts = products) => {
    return sourceProducts
      .slice(0, 40)
      .map(p => `Tên: ${p.name} | Giá: ${Number(p.price || 0).toLocaleString()}đ | Tồn kho: ${Number(p.stock || 0)} | Danh mục: ${p.category || 'Chưa rõ'} | Mô tả: ${p.description || ''}`)
      .join('\n');
  };

  const saveCartToFirebase = async (newCart) => {
    if (typeof db === 'undefined' || !db || !currentUser?.uid || currentUser.uid.startsWith('guest_')) return;

    await set(ref(db, `cart_drafts/${currentUser.uid}`), {
      userName: currentUser.displayName,
      items: newCart,
      totalPrice: newCart.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0),
      time: Date.now(),
      status: newCart.length > 0 ? 'Đang chọn món' : 'Đã hủy giỏ'
    });
  };

  const handleAddToCart = async (product, qty = 1) => {
        if (product.stock <= 0) {

      notify("Sản phẩm đã hết hàng!");

      return;
    }
    const existingQty =
      cart.find(i => i.id === product.id)?.qty || 0;

    if (existingQty + qty > product.stock) {

      notify(
        `Chỉ còn ${product.stock} sản phẩm trong kho!`
      );

      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    const newCart = existingItem
      ? cart.map(item => item.id === product.id ? { ...item, qty: Number(item.qty || 0) + qty } : item)
      : [...cart, { ...product, qty }];

    setCart(newCart);
    notify(`Đã thêm ${product.name} vào giỏ`);

    try {
      await saveCartToFirebase(newCart);
    } catch (error) {
      console.error('Lỗi lưu giỏ hàng:', error);
    }

    if (newCart.length >= 2) {
      const checkText = `Tôi vừa thêm ${product.name} vào giỏ hàng đã có ${newCart.map(i => i.name).join(', ')}. Giỏ hàng này có thiếu linh kiện phụ trợ hoặc xung đột điện áp nào không? Trả lời ngắn gọn.`;
      try {
        const response = await fetch('https://smart-retail-user.onrender.com/user-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: checkText,
            context: buildCompactProductContext(),
            user_id: currentUser?.uid || 'guest',
            history: chatHistory.slice(-4).map(m => ({ role: m.role, content: m.content }))
          })
        });

        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'ai', content: data.answer || 'AI chưa có gợi ý tương thích.' }]);
      } catch (err) {
        console.error('AI compatibility check error:', err);
      }
    }
  };

  const toggleFavorite = (p) => {
    setFavorites(prev => {
      const uniquePrev = Array.from(
        new Map(prev.map(item => [item.id, item])).values()
      );

      const exists = uniquePrev.some(item => item.id === p.id);

      if (exists) {
        notify(`Đã bỏ ${p.name} khỏi yêu thích`);
        return uniquePrev.filter(item => item.id !== p.id);
      }

      notify(`Đã lưu ${p.name} vào yêu thích`);
      return [...uniquePrev, p];
    });
  };

  const toggleCompare = (p) => {
    setCompareList(prev => {
      if (prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 2) return [prev[1], p];
      return [...prev, p];
    });
  };

  const updateQty = async (id, delta) => {
    const newCart = cart
      .map(item => item.id === id ? { ...item, qty: Math.max(0, Number(item.qty || 0) + delta) } : item)
      .filter(i => i.qty > 0);

    setCart(newCart);

    try {
      await saveCartToFirebase(newCart);
    } catch (error) {
      console.error('Lỗi cập nhật giỏ hàng:', error);
    }
  };

 
  const addAgentSystemLog = (log) => {
    setAgentLogs(prev => [...prev.slice(-3), { id: Date.now(), text: log }]);
  };

  const handleAIChatbot = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: "user", content: text };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setIsThinking(true);
    setAgentLogs([]);

    const steps = [
      "Đang nhận diện yêu cầu từ người dùng...",
      
      
    ];
    for (const step of steps) {
      addAgentSystemLog(step);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const apiHistory = newHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || msg.parts?.[0]?.text }]
      }));
      
      const productContext = buildCompactProductContext();

      const response = await fetch("https://smart-retail-user.onrender.com/user-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
        question: text,
        context: productContext,
        user_id: currentUser?.uid || "guest",
        history: newHistory.slice(-10)
      })
      });

const data = await response.json();

const answer = data.answer || "AI chưa có phản hồi.";
      setIsThinking(false);
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: answer
        }
      ]);
    } catch (e) {
      setIsThinking(false);
      setChatHistory(prev => [...prev, { role: "ai", content: "Trợ lý AI đang bận xử lý hoặc mất kết nối: " + e.message }]);
    } finally {
      resetTranscript();
    }
  };

  useEffect(() => { if (!listening && transcript) handleAIChatbot(transcript); }, [listening]);

  // --- AUTH & CHECKOUT LOGIC ---
  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth();
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.photoURL) sessionStorage.setItem('userProfilePicture', user.photoURL);
      setCurrentUser({
        uid: user.uid,
        displayName: user.displayName || user.email || "Khách hàng",
        photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        email: user.email,
        rank: 'Hạng Pro'
      });
      
      if (user.email) setCustomerEmail(user.email);
      setShowLoginRequired(false);
      if (onLoginSuccess) setTimeout(() => onLoginSuccess(), 100);
    } catch (err) {
      alert("Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  const handleOpenCheckout = () => {
    if (currentUser.uid.startsWith('guest_')) {
      setShowLoginRequired(true);
      return;
    }
    if (cart.length === 0) return notify("Giỏ hàng của bạn đang trống!");
    setCheckoutStep(1);
    setShowCheckoutModal(true);
  };

  const generateOrderId = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const orderNo = String(orderCount).padStart(2, '0');
    return `${day}${month}${year}-No.${orderNo}`;
  };

  const saveLockerAccess = async ({ orderId, pin, email, userId, userName, timestamp }) => {
    if (typeof db === 'undefined' || !db || !pin) return;

    const safeOrderId = orderId.replace(/[.#$/\[\]]/g, '_');

    await set(ref(db, `locker_access/${safeOrderId}`), {
      box_no: '04',
      current_pin: pin,
      email,
      orderId,
      userId,
      userName,
      status: 'waiting',
      createdAt: timestamp,
      openedAt: null,
      closedAt: null,
      openedBy: '',
      lastWrongAt: null,
      openDurationMs: 60000,
      time_out: '1 min'
    });
  };

  const updateProductStocks = async (items) => {
    if (typeof db === 'undefined' || !db) return;

    await Promise.all(items.map(async (item) => {
      const currentProduct = products.find(p => p.id === item.id);
      if (!currentProduct) return;

      const nextStock = Math.max(Number(currentProduct.stock || 0) - Number(item.qty || 0), 0);
      await update(ref(db, `products/${item.id}`), { stock: nextStock });
    }));
  };

  // GỬI EMAIL THÔNG BÁO THỰC TẾ QUA EMAILJS
  const sendConfirmationEmail = async (orderData) => {
    const itemsTableRows = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
        <td style="padding: 8px; text-align: left;">${item.name}</td>
        <td style="padding: 8px; text-align: center;">${item.qty}</td>
        <td style="padding: 8px; text-align: right;">${Number(item.price).toLocaleString()}đ</td>
        <td style="padding: 8px; text-align: right;">${Number((item.price || 0) * item.qty).toLocaleString()}đ</td>
      </tr>
    `).join('');

    const subtotal = orderData.items.reduce((sum, item) => sum + ((item.price || 0) * item.qty), 0);
    
    const total = subtotal;

    let pickupValue = '';
    if (orderData.type === 'locker') pickupValue = orderData.locker_pin;
    else if (orderData.type === 'counter') pickupValue = orderData.queue_no;
    else if (orderData.type === 'shipping') pickupValue = orderData.address;

    const emailParams = {
      to_email: orderData.email,
      user_name: orderData.userName,
      email: orderData.email,
      order_id: orderData.orderId,
      order_time: new Date().toLocaleString('vi-VN'),
      product_subtotal: Number(subtotal).toLocaleString() + 'đ',
      total_price: Number(total).toLocaleString() + 'đ',
      items_table_rows: itemsTableRows,
      payment_method: orderData.payment_method === 'transfer' ? 'Chuyển khoản ngân hàng' : 'Thanh toán tiền mặt',
      payment_status: orderData.status,
      pickup_value: pickupValue,
      delivery_type: orderData.type === 'locker' ? 'Tủ Smart Locker' : orderData.type === 'counter' ? 'Nhận tại quầy' : 'Giao hàng tận nơi'
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams);
      console.log('✅ Email xác nhận đơn hàng đã gửi tới: ' + orderData.email);
      return true;
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      return false;
    }
  };

  const confirmOrder = async () => {
    const resolvedEmail = customerEmail.trim() || currentUser?.email || '';

    if (!paymentMethod || !deliveryMethod) return alert('Vui lòng chọn đủ thông tin thanh toán và nhận hàng!');
    if (!phone.trim() && !resolvedEmail) return alert('Vui lòng cung cấp Số điện thoại hoặc Email!');
    if (resolvedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) return alert('Email không hợp lệ!');
    if (deliveryMethod === 'shipping' && !address.trim()) return alert('Vui lòng nhập địa chỉ giao hàng!');

    setIsProcessing(true);

    const finalTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    const orderId = generateOrderId();
    const timestamp = Date.now();
    const pin = deliveryMethod === 'locker' ? Math.floor(100000 + Math.random() * 900000).toString() : null;
    const stt = deliveryMethod === 'counter' ? Math.floor(100 + Math.random() * 900).toString() : null;

    const newOrder = {
      id: orderId,
      orderId,
      userId: currentUser.uid,
      userName: currentUser.displayName,
      items: cart,
      totalPrice: finalTotal,
      payment_method: paymentMethod,
      status: paymentMethod === 'transfer' ? 'Đã thanh toán' : 'Tiền mặt (Chưa thu)',
      type: deliveryMethod,
      address: deliveryMethod === 'shipping' ? address.trim() : '',
      phone: phone.trim(),
      email: resolvedEmail,
      locker_pin: pin,
      queue_no: stt,
      time: timestamp,
      completedAt: timestamp
    };

    try {
      if (typeof db !== 'undefined' && db) {
        const firebaseOrderId = orderId.replace(/[.#$/\[\]]/g, '_');

        await set(ref(db, `orders/${currentUser.uid}/${firebaseOrderId}`), newOrder);
        await set(ref(db, `carts/${currentUser.uid}/${firebaseOrderId}`), newOrder);


        if (deliveryMethod === 'locker' && pin) {
          await saveLockerAccess({
            orderId,
            pin,
            email: resolvedEmail,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            timestamp
          });
        }

        await updateProductStocks(cart);
        // KHÔNG xóa carts/${currentUser.uid} ở đây vì Admin Dashboard đang lắng nghe dữ liệu đơn/giỏ hàng realtime.
        // Chỉ xóa giỏ hàng local sau khi đã tạo đơn thành công để tránh mất đồng bộ lên Web Admin.
      }

      const updatedHistory = [newOrder, ...orderHistory];
      setOrderHistory(updatedHistory);
      localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));

      const nextOrderCount = orderCount + 1;
      setOrderCount(nextOrderCount);
      localStorage.setItem('orderCount', String(nextOrderCount));

      setOrderReceipt(newOrder);
      setTechPoints(prev => prev + Math.floor(finalTotal / 1000));

      if (resolvedEmail) await sendConfirmationEmail(newOrder);

      setCart([]);
      setCheckoutStep(2);
    } catch (error) {
      alert('Lỗi kết nối: ' + error.message);
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = useMemo(() => cart.reduce((s, i) => s + ((i.price || 0) * i.qty), 0), [cart]);

  const filteredProducts = products.filter(p => 
    (activeCategory === 'Tất cả' || p.category === activeCategory) &&
    p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- SIDEBAR ITEM COMPONENT ---
  const SidebarItem = ({ id, icon: Icon, label, badge }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'stroke-[2px]' : ''} />
      {isSidebarOpen && <span className="font-semibold text-sm tracking-tight">{label}</span>}
      {badge > 0 && isSidebarOpen && (
        <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  const uniqueFavorites = Array.from(
  new Map(favorites.map(item => [item.id, item])).values()
);

  return (
    <div className="flex h-screen w-full transition-colors duration-300 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 md:relative md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
            <CpuIcon size={22} strokeWidth={2} />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-xl font-black tracking-tight dark:text-white"><span className="text-indigo-600">AIoT RETAIL</span></span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <SidebarItem id="Components" icon={Package} label="Cửa hàng" />
          <SidebarItem id="Favorites" icon={Heart} label="Yêu thích" badge={uniqueFavorites.length} />
          <SidebarItem id="Shop" icon={ShoppingCart} label="Giỏ hàng" badge={cart.length} />
          <SidebarItem id="Community" icon={Layers} label="Project Hub" />
          <SidebarItem id="AI" icon={Bot} label="Trợ lí AI" />
          <SidebarItem id="Orders" icon={History} label="Giao dịch" />
        </nav>

        <div className="p-4 space-y-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
            {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} />}
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">{isDarkMode ? 'Light' : 'Dark'}</span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full p-2 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center">
            {isSidebarOpen ? <ChevronRight className="rotate-180" size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-[60] flex md:hidden items-center justify-around px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        {[
          { id: 'Components', icon: Package },
          { id: 'Favorites', icon: Heart },
          { id: 'Shop', icon: ShoppingCart },
          { id: 'AI', icon: Bot }
        ].map((item, i) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-500'}`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 md:px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Tìm cảm biến, vi điều khiển..." 
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full py-2.5 pl-12 pr-6 text-sm font-medium focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-6">
            <div className="hidden lg:flex flex-col items-end pr-6 border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <Target size={16} strokeWidth={2.5} />
                <span className="text-sm font-black tracking-tight">{techPoints.toLocaleString()} TP</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">{currentUser.rank}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{currentUser.displayName}</p>
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest mt-0.5">Online</p>
              </div>
              <div className="relative flex items-center gap-3">
                <img src={currentUser.photoURL} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" alt="avatar" />
                <button 
                  onClick={() => {
                    if(onLogout) onLogout();
                    setCurrentUser({ uid: "guest_123", displayName: "Khách hàng", rank: "Mới" });
                  }} 
                  className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-32">
          
          {/* TAB: SHOP */}
          {(activeTab === 'Components' || activeTab === 'Favorites') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              
              {activeTab === 'Components' && (
                <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 md:p-12 text-white overflow-hidden shadow-lg">
                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Sparkles size={14} className="text-yellow-300" /> Giải pháp IoT toàn diện
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                      Smartech Enterprise Lab
                    </h1>
                    <p className="text-indigo-100 text-sm md:text-base font-medium opacity-90 max-w-lg">
                      Linh kiện thông minh tích hợp AI hỗ trợ kiểm tra mạch, gợi ý tương thích tự động.
                    </p>
                  </div>
                  <CpuIcon size={240} className="absolute -bottom-10 -right-10 text-white/10 rotate-12 pointer-events-none" />
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h3 className="text-xl md:text-2xl font-black dark:text-white flex-1 whitespace-nowrap">
                   {activeTab === 'Favorites' ? 'Sản phẩm đã lưu' : 'Tất cả sản phẩm'}

                </h3>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                  {['Tất cả', 'Vi điều khiển', 'Cảm biến', 'Module Rời', 'Màn hình'].map(cat => (
                    <button 
                      key={cat} onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        activeCategory === cat 
                          ? 'bg-slate-900 text-white dark:bg-indigo-600' 
                          : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {products.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
                  <Package className="mx-auto mb-4 opacity-50" size={64} strokeWidth={1.5} />
                  <p className="text-lg font-bold">Chưa có linh kiện nào từ Admin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(activeTab === 'Components' ? filteredProducts : filteredProducts.filter(p => uniqueFavorites.find(f => f.id === p.id))).map(p => {
                     const isFav = favorites.find(f => f.id === p.id);
                     const isComp = compareList.find(c => c.id === p.id);
                     return (
                      <motion.div 
                        key={p.id} layout whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative flex flex-col"
                      >
                        {p.tag && (
                          <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase">
                            {p.tag}
                            {
                              p.stock <= 0 && (

                                <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">

                                  HẾT HÀNG

                                </div>

                              )
                            }
                          </div>
                          
                        )}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button onClick={() => toggleFavorite(p)} className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-all ${isFav ? 'bg-rose-500 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-rose-500'}`}>
                            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                          </button>
                          <button onClick={() => toggleCompare(p)} className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-all ${isComp ? 'bg-indigo-600 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-indigo-600'}`}>
                            <GitCompare size={16} />
                          </button>
                        </div>

                        <div onClick={() => setSelectedProduct(p)} className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-6 cursor-zoom-in relative">
                          <img src={p.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500" alt="product" />
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-md text-[9px] font-bold text-slate-500 border border-slate-100 dark:border-slate-700 shadow-sm uppercase">
                            <MapPin size={10} className="text-indigo-500" /> {p.location || 'Kho'}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase line-clamp-1">{p.category || 'Mạch'}</p>
                            <div className="flex items-center gap-1 text-yellow-400"><Star size={10} fill="currentColor"/> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{p.rating || '5.0'}</span></div>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                          <div className="mt-2 min-h-[20px]">

                            {

                              p.stock <= 0

                                ? (

                                  <span className="text-red-500 font-bold text-xs">
                                    ❌ Hết hàng
                                  </span>

                                )

                                : p.stock <= 5

                                ? (

                                  <span className="text-orange-500 font-bold text-xs">
                                    ⚠️ Chỉ còn {p.stock} sản phẩm
                                  </span>

                                )

                                : (

                                  <span className="text-emerald-600 font-semibold text-xs">
                                    ✅ Còn {p.stock} sản phẩm
                                  </span>

                                )

                            }

                          </div>
                          <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-50 dark:border-slate-800">
                            <div>
                              <p className="text-[10px] text-slate-400 line-through font-semibold">{((p.price || 0) * 1.2).toLocaleString()}đ</p>
                              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{Number(p.price || 0).toLocaleString()}đ</p>
                            </div>
                            <button

                              disabled={p.stock <= 0}

                              onClick={() => handleAddToCart(p)}

                              className={`

                                w-10
                                h-10
                                text-white
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                transition-all
                                shadow-md

                                ${

                                  p.stock <= 0

                                    ? "bg-slate-300 cursor-not-allowed"

                                    : p.stock <= 5

                                    ? "bg-orange-500 hover:scale-105 active:scale-95"

                                    : "bg-slate-900 dark:bg-indigo-600 hover:scale-105 active:scale-95"
                                }

                              `}
                            >
                              {

                                p.stock <= 0

                                  ? <X size={18} strokeWidth={3} />

                                  : <Plus size={20} strokeWidth={2.5} />

                              }
                            </button>
                          </div>
                        </div>
                      </motion.div>
                     );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: CART */}
          {activeTab === 'Shop' && (
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300">
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-2xl font-black dark:text-white text-slate-800">Giỏ hàng ({cart.length})</h3>
                  <button onClick={() => setCart([])} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs uppercase hover:bg-rose-500 hover:text-white transition-all">Dọn dẹp</button>
                </div>
                
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <motion.div layout key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 shadow-sm relative">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 shrink-0">
                          <img src={item.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="i" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase">{item.category || 'Mạch'}</span>
                          <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-1">{item.name}</h4>
                          <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{Number(item.price || 0).toLocaleString()}đ</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                             <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-md shadow-sm text-slate-500 hover:text-rose-500"><Minus size={14}/></button>
                             <span className="w-8 text-center font-bold text-sm dark:text-white">{item.qty}</span>
                             <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-md shadow-sm text-slate-500 hover:text-indigo-600"><Plus size={14}/></button>
                           </div>
                           <button onClick={() => updateQty(item.id, -item.qty)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
                    <ShoppingCart className="mx-auto mb-4 opacity-50" size={64} strokeWidth={1.5} />
                    <p className="text-lg font-bold">Giỏ hàng trống</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
              <div className="w-full lg:w-[360px]">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl sticky top-6">
                  <h4 className="text-lg font-black dark:text-white mb-6">
                    Tóm tắt đơn hàng
                  </h4>

                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Tổng tiền hàng</span>
                      <span>{totalPrice.toLocaleString()}đ</span>
                    </div>

                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Vận chuyển</span>
                      <span>MIỄN PHÍ</span>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

                    <div className="flex justify-between items-end">
                      <span className="font-bold dark:text-white">Thanh toán</span>
                      <span className="text-2xl font-black text-indigo-600">
                        {totalPrice.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenCheckout}
                    className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Thanh toán <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              )}
            </div>
          )}

          {/* TAB: COMMUNITY */}
          {activeTab === 'Community' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div><h2 className="text-3xl font-black dark:text-white">Project Hub</h2><p className="text-slate-500 text-sm mt-1">Mua trọn bộ linh kiện từ dự án.</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {COMMUNITY_PROJECTS.map(proj => (
                  <div key={proj.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      <img src={proj.image} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="proj" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <h4 className="text-lg font-black">{proj.title}</h4>
                          <p className="text-xs text-indigo-200">@{proj.author}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm"><Heart size={12} fill="white"/> {proj.likes}</div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <button onClick={() => { proj.parts.forEach(pid => { const p = products.find(x => x.id === pid); if (p) handleAddToCart(p); }); notify("Đã thêm combo dự án!"); }} className="w-full py-3 mt-auto bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all text-sm">
                        Thêm Combo vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: AI AGENT  */}
          {activeTab === 'AI' && (
            <div className="w-full h-[calc(100vh-150px)] max-h-[calc(100vh-150px)] flex flex-col bg-white dark:bg-slate-900 relative overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/50 dark:bg-slate-900/50 gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md"><Bot size={24} /></div>
                <div>
                  <h4 className="font-black dark:text-white text-lg">AI Agent</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="flex items-center gap-1 text-[10px] text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Sẵn sàng</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <CpuIcon size={48} className="text-indigo-500 mb-4" />
                    <p className="text-lg font-bold text-slate-500">Hỏi AI về kỹ thuật mạch điện...</p>
                  </div>
                )}
                
                {chatHistory.map((msg, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%]">
                      <div className={`p-4 rounded-2xl font-medium text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'}`}>
                        {msg.role === 'user' ? (
                          <span>{msg.content}</span>
                        ) : (
                      <div
                        className="
                          prose prose-sm
                          max-w-none
                          text-slate-700
                          leading-7

                          prose-headings:text-slate-900
                          prose-strong:text-slate-900

                          prose-table:block
                          prose-table:w-full
                          prose-table:overflow-x-auto
                          prose-table:border
                          prose-table:border-slate-300
                          prose-table:rounded-2xl

                          prose-thead:bg-slate-100

                          prose-th:border
                          prose-th:border-slate-300
                          prose-th:px-4
                          prose-th:py-3
                          prose-th:text-slate-800
                          prose-th:font-bold

                          prose-td:border
                          prose-td:border-slate-200
                          prose-td:px-4
                          prose-td:py-3

                          prose-tr:bg-white
                          prose-tr:hover:bg-slate-50

                          prose-code:text-blue-600
                        "
                      >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-4">
                              <table
                                className="w-full border border-slate-300 rounded-2xl overflow-hidden text-sm"
                                {...props}
                              />
                            </div>
                          ),

                          thead: ({node, ...props}) => (
                            <thead
                              className="bg-slate-100 text-slate-800"
                              {...props}
                            />
                          ),

                          th: ({node, ...props}) => (
                            <th
                              className="border border-slate-300 px-4 py-3 text-left font-bold"
                              {...props}
                            />
                          ),

                          td: ({node, ...props}) => (
                            <td
                              className="border border-slate-200 px-4 py-3"
                              {...props}
                            />
                          ),

                          tr: ({node, ...props}) => (
                            <tr
                              className="bg-white hover:bg-slate-50"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                      <Loader2 size={16} className="animate-spin text-indigo-600" />
                      <span className="text-xs font-bold text-slate-500">Đang phân tích...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-full focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <button onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ language: 'vi-VN' })} className={`p-2.5 rounded-full transition-all ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 shadow-sm'}`}><Mic size={20}/></button>
                  <input type="text" placeholder="Nhập câu hỏi kỹ thuật..." className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium text-slate-700 dark:text-white" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inputValue.trim()) { handleAIChatbot(inputValue); setInputValue(""); } } }} />
                  <button onClick={() => { handleAIChatbot(inputValue); setInputValue(""); }} disabled={!inputValue.trim() || isThinking} className="p-2.5 bg-indigo-600 text-white rounded-full shadow-md disabled:bg-slate-300 disabled:shadow-none"><ArrowRight size={20}/></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Orders' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
               <h3 className="text-2xl font-black dark:text-white">Lịch sử giao dịch</h3>
               <div className="space-y-4">
                {orderHistory.length > 0 ? orderHistory.map(order => (
                  <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center"><Box size={20}/></div>
                        <div><p className="text-[10px] font-bold text-slate-400">Order ID</p><h4 className="font-black text-sm dark:text-white">#{order.id || order.orderId}</h4></div>
                      </div>
                      <div className="grid grid-cols-2 sm:flex gap-6 sm:gap-10">
                        <div><p className="text-[10px] font-bold text-slate-400">Thanh toán</p><p className="font-black text-sm text-indigo-600">{Number(order.totalPrice || order.total || 0).toLocaleString()}đ</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400">Mã Nhận</p><p className="font-black text-sm text-slate-800 dark:text-white">{order.pin || order.locker_pin || order.stt || order.queue_no || '---'}</p></div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase">{order.status}</div>
                    </div>
                  </div>
                )) : <div className="py-20 text-center"><History size={64} className="mx-auto mb-4 text-slate-300"/><p className="text-lg font-bold text-slate-400">Chưa có giao dịch.</p></div>}
               </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: BẢNG SO SÁNH */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCompareModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"><ArrowLeftRight size={20} className="text-indigo-600"/> So sánh linh kiện</h3>
                <button onClick={() => setShowCompareModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-50 text-slate-500"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-10 pt-48">
                    <div className="h-8 flex items-center text-xs font-bold text-slate-400">Giá bán</div>
                    <div className="h-8 flex items-center text-xs font-bold text-slate-400">Vị trí</div>
                    <div className="h-8 flex items-center text-xs font-bold text-slate-400">Thông số</div>
                  </div>
                  {compareList.map(item => (
                    <div key={item.id} className="text-center">
                      <img src={item.image} className="w-24 h-24 mx-auto object-contain mb-4" alt="c"/>
                      <h4 className="font-bold text-sm h-10 line-clamp-2 dark:text-white mb-6">{item.name}</h4>
                      <div className="h-8 flex items-center justify-center font-black text-indigo-600 mb-10">{Number(item.price).toLocaleString()}đ</div>
                      <div className="h-8 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 mb-10">{item.location} / {item.shelf}</div>
                      <div className="text-left space-y-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                        {Object.entries(item.specs || {}).map(([key, val]) => (
                          <div key={key} className="text-[10px] border-b border-slate-200 dark:border-slate-700 pb-1"><span className="font-bold text-slate-400">{key}:</span> <span className="dark:text-white font-medium">{val}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* THANH SO SÁNH NỔI */}
      <AnimatePresence>
        {compareList.length > 0 && !showCompareModal && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-4 bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-3xl shadow-xl">
            <div className="flex gap-2">
              {compareList.map(item => (
                <div key={item.id} className="relative w-10 h-10 bg-white rounded-lg p-1">
                  <img src={item.image} className="w-full h-full object-contain" alt="c"/>
                  <button onClick={() => toggleCompare(item)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5"><X size={10}/></button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowCompareModal(true)} disabled={compareList.length < 2} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${compareList.length === 2 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/30'}`}>So sánh</button>
          </motion.div>
        )}
      </AnimatePresence>

{/* TOÀN BỘ MODAL THANH TOÁN HOÀN CHỈNH */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white w-full max-w-[500px] rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
            >
              {/* HEADER MODAL */}
              <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-black text-slate-800">
                  {checkoutStep === 1 ? 'Thông tin thanh toán' : 'Đặt hàng thành công'}
                </h3>
                {checkoutStep === 1 && (
                  <button onClick={() => {
                    setShowCheckoutModal(false);
                    setPaymentMethod(''); setDeliveryMethod(''); setCustomerEmail(''); setAddress(''); setCheckoutStep(1);
                  }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {checkoutStep === 1 ? (
                <>
                  {/* BƯỚC 1: GIAO DIỆN NHẬP LIỆU CỦA BẠN */}
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-left space-y-8 bg-slate-50/50">
                    
                    {/* Thông liên lạc */}
                    <section>
                      <h4 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span> Thông tin liên lạc
                      </h4>
                      <div className="space-y-3 bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div>
                          <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Số điện thoại <span className="text-slate-400 font-normal">(Nhận SMS/Mã tủ)</span></label>
                          <input 
                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[15px] font-medium text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                            placeholder="Nhập SĐT (Ví dụ: 0344881004)" 
                          />
                        </div>
                        <div>
                          <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Email <span className="text-slate-400 font-normal">(Nhận hóa đơn chi tiết)</span></label>
                          <input 
                            type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[15px] font-medium text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            placeholder="ngoc@gmail.com" 
                          />
                          <p className="text-[10px] text-slate-400 mt-2 font-bold italic">
                            * Hệ thống chấp nhận SĐT, Email hoặc cả hai để thông báo.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Phương thức thanh toán */}
                    <section>
                      <h4 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">2</span> Thanh toán
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer p-4 rounded-[1.25rem] border-2 flex flex-col gap-4 transition-all ${paymentMethod === 'transfer' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} />
                          <div className="flex justify-between items-center">
                            <div className={`p-2 rounded-xl ${paymentMethod === 'transfer' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                              <CreditCard size={20} />
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'transfer' ? 'border-indigo-600' : 'border-slate-300'}`}>
                              {paymentMethod === 'transfer' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                            </div>
                          </div>
                          <span className="font-bold text-[15px] text-slate-800">Chuyển khoản</span>
                        </label>

                        <label className={`cursor-pointer p-4 rounded-[1.25rem] border-2 flex flex-col gap-4 transition-all ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                          <div className="flex justify-between items-center">
                            <div className={`p-2 rounded-xl ${paymentMethod === 'cash' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                              <Banknote size={20} />
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-indigo-600' : 'border-slate-300'}`}>
                              {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                            </div>
                          </div>
                          <span className="font-bold text-[15px] text-slate-800">Tiền mặt</span>
                        </label>
                      </div>
                    </section>

                    {/* Hình thức nhận hàng */}
                    <section>
                      <h4 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">3</span> Hình thức nhận hàng
                      </h4>
                      <div className="space-y-3">
                        {[
                          { id: 'locker', icon: Package, title: 'Tủ Smart Locker', desc: 'Lấy tại tủ tự động 24/7 bằng mã PIN' },
                          { id: 'counter', icon: Store, title: 'Nhận tại quầy', desc: 'Lấy trực tiếp tại quầy bằng số thứ tự' },
                          { id: 'shipping', icon: Truck, title: 'Giao hàng tận nơi', desc: 'Shipper giao an toàn đến địa chỉ của bạn' }
                        ].map((method) => (
                          <label key={method.id} className={`cursor-pointer p-4 rounded-[1.25rem] border-2 flex items-center gap-4 transition-all ${deliveryMethod === method.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                            <input type="radio" name="delivery" className="hidden" checked={deliveryMethod === method.id} onChange={() => setDeliveryMethod(method.id)} />
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${deliveryMethod === method.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                              <method.icon size={22} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-[15px] text-slate-800">{method.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{method.desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === method.id ? 'border-indigo-600' : 'border-slate-300'}`}>
                              {deliveryMethod === method.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                            </div>
                          </label>
                        ))}
                      </div>

                      {deliveryMethod === 'shipping' && (
                        <div className="mt-4 bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                          <label className="text-[13px] font-bold text-slate-700 mb-2 block">Địa chỉ giao hàng chi tiết</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[15px] text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none" 
                            rows="2" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..." onChange={(e) => setAddress(e.target.value)} 
                          />
                        </div>
                      )}
                    </section>
                  </div>

                  {/* FOOTER BƯỚC 1 */}
                  <div className="p-6 pt-0 bg-white rounded-b-[24px] shrink-0 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-500 font-bold">Cần thanh toán:</span>
                      <span className="text-3xl font-black text-indigo-600">{(totalPrice).toLocaleString()} ₫</span>
                    </div>
                    <button 
                      disabled={
                        isProcessing || !paymentMethod || !deliveryMethod || 
                        (!phone.trim() && !customerEmail.trim() && !(currentUser && currentUser.email)) || 
                        (deliveryMethod === 'shipping' && !address)
                      } 
                      onClick={confirmOrder} 
                      className={`w-full py-4 rounded-[14px] font-black tracking-widest text-[15px] uppercase transition-all flex justify-center items-center gap-2 ${
                        paymentMethod && deliveryMethod && (phone.trim() || customerEmail.trim()) && !isProcessing
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 active:scale-[0.98]' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                      ) : 'Xác nhận đặt hàng'}
                    </button>
                  </div>
                </>
              ) : (
                /* BƯỚC 2: MÀN HÌNH THÀNH CÔNG - CHỈ SỬA UI, GIỮ NGUYÊN LOGIC FIREBASE/ADMIN */
                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center text-center space-y-6 bg-white">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={40} strokeWidth={3} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Đặt hàng thành công!</h2>
                    <p className="text-slate-500 font-medium mt-1">Cảm ơn bạn đã tin tưởng AIoT Retail</p>
                  </div>

                  <div className="w-full bg-slate-50 p-6 rounded-[2rem] space-y-5 border border-slate-100 shadow-inner">
                    {orderReceipt?.queue_no && (
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Số thứ tự của bạn</p>
                        <span className="text-5xl font-black text-slate-800 tracking-widest">#{orderReceipt.queue_no}</span>
                      </div>
                    )}

                    {orderReceipt?.locker_pin && (
                      <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg border-2 border-white/20">
                        <p className="text-[11px] font-black text-white/70 uppercase mb-2 tracking-[0.2em]">Mã PIN mở tủ</p>
                        <span className="text-5xl font-black text-white tracking-[0.2em]">{orderReceipt.locker_pin}</span>
                      </div>
                    )}

                    {orderReceipt?.payment_method === 'transfer' && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-slate-100">
                          <img
                            src={`https://img.vietqr.io/image/BIDV-6261330756-compact2.png?amount=${orderReceipt.totalPrice}&addInfo=SMART_TECH_${orderReceipt.id}`}
                            className="w-48 h-48 object-contain"
                            alt="VietQR"
                          />
                        </div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Quét VietQR để thanh toán</p>
                      </div>
                    )}

                    {orderReceipt?.payment_method === 'cash' && (
                      <div className="py-4 px-3 bg-amber-50 border border-amber-100 rounded-2xl">
                        <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                          <Banknote size={18} />
                          <span className="font-black text-xs uppercase">Thanh toán tiền mặt</span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-600 leading-relaxed">
                          {orderReceipt.type === 'locker' && 'Vui lòng thanh toán tại quầy Admin để kích hoạt mã PIN.'}
                          {orderReceipt.type === 'counter' && 'Vui lòng thanh toán tại quầy khi đọc số thứ tự nhận hàng.'}
                          {orderReceipt.type === 'shipping' && 'Vui lòng chuẩn bị sẵn tiền mặt để gửi cho Shipper.'}
                        </p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã đơn</p>
                      <p className="text-sm font-black text-slate-700 mt-1">{orderReceipt?.id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setCheckoutStep(1);
                      setActiveTab('Orders');
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGIN MODAL */}
      <AnimatePresence>
        {showLoginRequired && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLoginRequired(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 relative shadow-xl text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32}/></div>
              <h3 className="text-xl font-black dark:text-white mb-2">Đăng nhập</h3>
              <p className="text-sm text-slate-500 mb-6">Đăng nhập để lưu đơn hàng và dùng AI.</p>
              <button onClick={handleGoogleLogin} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm mb-3">Đăng nhập bằng Google</button>
              <button onClick={() => setShowLoginRequired(false)} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 dark:hover:text-white transition-colors">Bỏ qua</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION */}
      <AnimatePresence>
        {showNotification && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-6 right-6 z-[130] flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl">
            <Sparkles size={16} className="text-yellow-400"/>
            <span className="text-xs font-bold">{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
