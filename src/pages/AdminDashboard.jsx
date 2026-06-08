import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, remove, update, serverTimestamp } from 'firebase/database';

import { sendSMS } from '../services/SMSService';
import { db } from '../services/firebase';
import {
  analyzeInventoryData,
  getAIInventoryStrategy,
  getQuickAdminInventoryMessage,
  buildInventoryAdminSummary,
  formatInventoryStrategyText
} from "../services/InventoryAIService";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  LayoutDashboard, Package, Users, Bell, LogOut, Activity, Plus,
  FileSpreadsheet, Trash2, Search, Settings, ArrowLeft, ArrowRight,
  Sparkles, TrendingUp, Zap, Download, AlertTriangle, Clock,
  DollarSign, Command, Loader2, X, Bot, CornerDownLeft,
  MessageSquare, Star, Edit, Terminal, LayoutGrid, List, Smartphone, HardDrive, Monitor, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const appId = typeof __app_id !== 'undefined' ? __app_id : 'smart-retail-hcmute';

const App = ({ onLogout }) => {
  const isLocalDbAvailable = typeof db !== 'undefined';
  const activeDb = isLocalDbAvailable ? db : sandboxDb;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', image: '', price: '', location: '', stock: '', category: ' ' });
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [waitingCarts, setWaitingCarts] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [inventoryInsights, setInventoryInsights] = useState([]);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [alertItems, setAlertItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [pagerId, setPagerId] = useState("");
  const [orderStatusTab, setOrderStatusTab] = useState('Chờ xử lý');
  const [systemLogs, setSystemLogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false); // Ẩn/hiện form thêm
  const [sortByLowStock, setSortByLowStock] = useState(false); // Bật/tắt sắp xếp tồn kho
  const [settings, setSettings] = useState({ autoSMS: true, soundEnabled: true, aiAutoReport: true, stockThreshold: 10, maintenanceMode: false });
  const [lockers, setLockers] = useState({});

  const addLog = (msg, type = 'info') => {
    setSystemLogs(prev => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString('vi-VN', { hour12: false }) }, ...prev].slice(0, 15));
  };

  // =======================================================================
  // AI STATE & REFS
  // =======================================================================
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [inventorySummary, setInventorySummary] = useState(null);
  const [quickMessage, setQuickMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  

  

  const handleGetStrategy = async () => {
    setIsLoading(true);
    setShowDropdown(true);
    setAiResult("AI Copilot đang phân tích dữ liệu kho và giá thị trường...");

    try {
const strategy = await getAIInventoryStrategy(inventoryInsights);


  // AI trả object
  console.log(strategy);

  // format đẹp cho admin
  const formatted = `
  📦 TỔNG QUAN KHO

  - Risk Items:
  ${strategy.summary.totalRiskItems}

  - Critical:
  ${strategy.summary.criticalItems}

  - Recommendation:
  ${strategy.summary.recommendation}

  ================================

  ${strategy.items.map(item => `

  🔴 ${item.name}

  - Risk:
  ${item.riskLevel}

  - Reason:
  ${item.reason}

  - Import:
  ${item.suggestedImport}

  - Priority:
  ${item.priority}

  `).join("\n")}

  ================================

  📌 ACTIONS:

  ${strategy.actions.map(
    a => `• ${a}`
  ).join("\n")}
  `;

  setAiResult(formatted);
    } catch (error) {
      setAiResult("Hệ thống đang bận, sếp vui lòng thử lại sau nhé!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0 && historyOrders.length > 0) {
const results = analyzeInventoryData(products, historyOrders);
console.log("INVENTORY INSIGHTS:", results);
setInventoryInsights(results);
setInventorySummary(buildInventoryAdminSummary(results));
setQuickMessage(getQuickAdminInventoryMessage(results));

  // ===================================
  // AI QUICK WARNING
  // ===================================

  const quickWarning =
    getQuickAdminInventoryMessage(
      results
    );

  setAiResult(quickWarning);

      const itemsToAlert = results.filter(item => item.isRisk);
      if (itemsToAlert.length > 0) {
        setAlertItems(itemsToAlert);
      const todayKey = new Date().toISOString().slice(0, 10);
      const dismissedKey = localStorage.getItem("stockAlertDismissedDate");

      if (dismissedKey !== todayKey) {
        setShowStockAlert(true);
      }
        const newNotis = itemsToAlert.map(item => ({
          id: `alert-${item.name}-${new Date().getDate()}`,
          title: "CẢNH BÁO TỒN KHO",
          message: `${item.name} dự kiến hết sạch trong ${item.weeksLeft} tuần. Sếp nhập hàng gấp nhé!`,
          time: new Date(),
          type: 'warning'
        }));

        setNotifications(prev => {
          const combined = [...newNotis, ...prev];
          return Array.from(new Map(combined.map(item => [item.id, item])).values()).slice(0, 20);
        });
      }
    }
  }, [products, historyOrders]);

  useEffect(() => {
    const handleKeyDownShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDownShortcut);
    return () => window.removeEventListener('keydown', handleKeyDownShortcut);
  }, []);


const buildAdminAIContext = () => {

  const productText = products.map(p => `
- ${p.name}
  Tồn kho: ${p.stock}
  Giá: ${Number(p.price || 0).toLocaleString()}đ
  Vị trí: ${p.location || "Chưa rõ"}
  Danh mục: ${p.category || "Chưa rõ"}
`).join("");

  const riskText = inventoryInsights.map(i => `
- ${i.name}
  Mức rủi ro: ${i.riskLevel}
  Tồn hiện tại: ${i.currentStock}
  Bán 4 tuần: ${i.soldIn4Weeks}
  Tốc độ bán/tuần: ${i.velocityPerWeek}
  Dự kiến hết hàng: ${i.estimatedStockoutDays} ngày
  Đề xuất nhập: ${i.suggestedImport}
`).join("");

  const waitingOrderText = waitingCarts.map(c => {
    const items = c.items?.map(i => `${i.qty}x ${i.name}`).join(", ");

    return `
- Khách: ${c.userName || "Không rõ"}
  Sản phẩm: ${items || "Không rõ"}
  Tổng tiền: ${Number(c.totalPrice || 0).toLocaleString()}đ
`;
  }).join("");

  const revenueToday = historyOrders
    .filter(order =>
      order.completedAt &&
      new Date(order.completedAt).toDateString() === new Date().toDateString()
    )
    .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

  return `
DỮ LIỆU HỆ THỐNG ADMIN

1. TỔNG QUAN
- Tổng sản phẩm: ${products.length}
- Tổng đơn đã hoàn thành: ${historyOrders.length}
- Đơn đang chờ xử lý: ${waitingCarts.length}
- Doanh thu hôm nay: ${revenueToday.toLocaleString()}đ

2. DANH SÁCH SẢN PHẨM
${productText || "Chưa có dữ liệu sản phẩm."}

3. PHÂN TÍCH RỦI RO KHO
${riskText || "Chưa có dữ liệu phân tích kho."}

4. ĐƠN HÀNG ĐANG CHỜ
${waitingOrderText || "Không có đơn hàng đang chờ."}
`;
};


const handleAskAI = async () => {

  if (!searchTerm.trim()) return;

  setIsLoading(true);

  setShowDropdown(true);

  setAiResult("AI COO Copilot đang phân tích dữ liệu...");

  try {

    // =========================
    // TẠO CONTEXT HỆ THỐNG
    // =========================

  const systemData = buildAdminAIContext();

    // =========================
    // GỌI FASTAPI BACKEND
    // =========================

    const response = await fetch(
      "https://smart-retail-user.onrender.com/ask-ai",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          question: searchTerm,
          context: systemData
        })
      }
    );

const rawText = await response.text();

let data;

try {
  data = JSON.parse(rawText);
} catch {
  throw new Error(rawText);
}

setAiResult(data?.answer || "AI chưa có phản hồi.");

} finally {
  setIsLoading(false);
}

};
  
  const handleKeyDownAI = (e) => {
    if (e.key === 'Enter') handleAskAI();
  };

  // =======================================================================
  // FIREBASE LISTENERS & CƠ CHẾ ĐỌC ĐƠN HÀNG THÔNG MINH
  // =======================================================================
  useEffect(() => {
    if (!activeDb) return;

    const productRef = ref(activeDb, 'products');
    const unsubscribeProd = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(list);
      } else {
        setProducts([]);
      }
    });

    

    const historyRef = ref(activeDb, 'history');
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setHistoryOrders(list);
      } else {
        setHistoryOrders([]);
      }
    });

    const cartRef = ref(activeDb, 'carts');
    const unsubscribeCart = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = [];
        Object.keys(data).forEach(uid => {
          const node = data[uid];
          if (!node || typeof node !== 'object') return;

          let hasOrder = false;

          Object.keys(node).forEach(key => {
            const child = node[key];
            if (typeof child === 'object' && child !== null && child.type) {
              list.push({ uid: uid, cartKey: key, ...child });
              hasOrder = true;
            }
          });

          if (!hasOrder && node.items) {
            list.push({ uid: uid, cartKey: uid, ...node });
          }
        });
        list.sort((a, b) => (b.time || 0) - (a.time || 0));
        
        if (list.length > waitingCarts.length) {
          addLog("Phát hiện đơn đặt hàng mới từ khách hàng!", "success");
        }
        
        setWaitingCarts(list);
      } else {
        setWaitingCarts([]);
      }
    });


    return () => {
      unsubscribeProd();
      unsubscribeCart();
      unsubscribeHistory();
    };
  }, [activeDb, waitingCarts.length]);


useEffect(() => {

  if (!activeDb) return;

  console.log("READ LOCKERS...");

  const lockerRef = ref(activeDb, "lockers");

  const unsubscribe = onValue(
    lockerRef,
    (snapshot) => {

      console.log(
        "LOCKER SNAP:",
        snapshot.val()
      );

      if (snapshot.exists()) {

        setLockers(snapshot.val());

      } else {

        setLockers({});

      }

    }
  );

  return () => unsubscribe();

}, [activeDb]);

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!activeDb) return alert("Lỗi: Chưa kết nối Database!");

    const existingProduct = products.find(
      p => p.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );

    if (existingProduct) {
      const productRef = ref(activeDb, `products/${existingProduct.id}`);
      update(productRef, {
        stock: Number(existingProduct.stock) + Number(formData.stock)
      }).then(() => {
        addLog(`Cộng thêm ${formData.stock} vào món "${existingProduct.name}"`, 'success');
        alert(`🔄 Món "${existingProduct.name}" đã có sẵn. Tự động CỘNG THÊM ${formData.stock} cái vào kho!`);
        setFormData({ name: '', image: '', price: '', location: '', stock: '', category: 'Vi điều khiển' });
      });
    } else {
      const productRef = ref(activeDb, 'products');
      const newRef = push(productRef);
      set(newRef, {
        name: formData.name.trim(),
        image: formData.image || `https://picsum.photos/seed/${Date.now()}/200/200`,
        price: Number(formData.price),
        location: formData.location,
        stock: Number(formData.stock),
        category: formData.category || 'Khác'
      }).then(() => {
        addLog(`Đã thêm mới phân loại: ${formData.name}`, 'success');
        alert("✅ Đã thêm một phân loại linh kiện mới tinh!");
        setFormData({ name: '', image: '', price: '', location: '', stock: '', category: '' });
      });
    }
  };

// HÀM TỰ ĐỘNG PHÂN LOẠI DỰA VÀO TÊN SẢN PHẨM
  const getProductCategory = (name) => {
    if (!name) return 'Khác';
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('esp') || lowerName.includes('arduino') || lowerName.includes('mạch') || lowerName.includes('vi điều khiển')) {
      return 'Vi điều khiển';
    }
    if (lowerName.includes('cảm biến') || lowerName.includes('dht') || lowerName.includes('sr04')) {
      return 'Cảm biến';
    }
    if (lowerName.includes('relay') || lowerName.includes('module')) {
      return 'Module Rời';
    }
    if (lowerName.includes('lcd') || lowerName.includes('màn hình') || lowerName.includes('oled') || lowerName.includes('hiển thị')) {
      return 'Màn hình';
    }
    return 'Phụ kiện';
  };

  // Lấy danh sách Categories tự động thông minh để hiển thị lên UI
  const categories = ['Tất cả', ...new Set(products.map(p => p.category ? p.category : getProductCategory(p.name)))];

  const filteredCarts = waitingCarts.filter(c => {
    if (orderStatusTab === 'Tất cả') return true;
    if (orderStatusTab === 'Chờ xử lý') return c.status === 'Đã thanh toán' || c.status === 'Tiền mặt (Chưa thu)' || c.status === 'Chờ thanh toán';
    if (orderStatusTab === 'Sẵn sàng') return c.status === 'Chờ khách đến lấy';
    return true;
  });

  // GỘP CHUNG LỌC (FILTER) VÀ SẮP XẾP (SORT) VÀO 1 BIẾN DUY NHẤT
  const filteredProducts = products
    .filter(p => {
      // 1. Tự động nội suy danh mục nếu Firebase bị thiếu
      const actualCategory = p.category ? p.category : getProductCategory(p.name);
      
      // 2. Lọc theo Tab danh mục (Lưu ý: Đảm bảo biến state bạn đang dùng là selectedCategory hoặc activeCategory, ở đây mình để selectedCategory theo code gốc của bạn)
      const matchCategory = selectedCategory === 'Tất cả' || actualCategory === selectedCategory;
      
      // 3. Lọc theo ô tìm kiếm
      const matchSearch = p?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      // Nếu sếp bật nút gạt, ưu tiên xếp mặt hàng có số lượng tồn thấp lên trước
      if (sortByLowStock) return a.stock - b.stock;
      return 0; // Tắt nút gạt thì giữ nguyên thứ tự gốc
    });
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      alert("⚠️ Vui lòng mở file Excel, chọn Save As -> Định dạng .CSV (Comma delimited) và tải lên lại nhé!");
      e.target.value = null;
      return;
    }

    addLog("Đang đọc và xử lý file CSV...", "info");

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);

      let countNew = 0;
      let countUpdate = 0;

      let separator = ',';
      if (lines.length > 0) {
        if (lines[0].includes(';')) separator = ';';
        else if (lines[0].includes('\t')) separator = '\t';
      }

      let currentProducts = [...products];

      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return;

        const cols = line.split(separator);

        if (cols.length >= 2) {
          if (!activeDb) return;

        
          const nameIdx = 0;      // Cột 1 trong file CSV: name
          const categoryIdx = 1;  // Cột 2 trong file CSV: category
          const priceIdx = 2;     // Cột 3 trong file CSV: price
          const stockIdx = 3;     // Cột 4 trong file CSV: stock
          const locIdx = 4;       // Cột 5 trong file CSV: location
          const imgIdx = 5;       // Cột 6 trong file CSV: image

          const parsedName = cols[nameIdx]?.replace(/['"]/g, '').trim() || "Chưa đặt tên";
          const parsedStock = Number(cols[stockIdx]?.replace(/[^0-9.-]+/g, "")) || 0;
          const parsedPrice = Number(cols[priceIdx]?.replace(/[^0-9.-]+/g, "")) || 0;
          const parsedLocation = cols[locIdx]?.replace(/['"]/g, '').trim() || "Kho chung";
          const parsedImage = cols[imgIdx]?.replace(/['"\r]/g, '').trim() || `https://picsum.photos/seed/${Date.now() + index}/200/200`;

          const existingProductIndex = currentProducts.findIndex(
            p => p.name.toLowerCase().trim() === parsedName.toLowerCase()
          );

          if (existingProductIndex !== -1) {
            const existingProduct = currentProducts[existingProductIndex];
            const newStock = Number(existingProduct.stock) + parsedStock;
            const productRef = ref(activeDb, `products/${existingProduct.id}`);
            update(productRef, { stock: newStock });
            currentProducts[existingProductIndex].stock = newStock;
            countUpdate++;
          } else {
            const productRef = ref(activeDb, 'products');
            const newRef = push(productRef);
            const newProductData = {
              name: parsedName,
              price: parsedPrice,
              location: parsedLocation,
              stock: parsedStock,
              image: parsedImage,
              category: getProductCategory(parsedName)
            };
            set(newRef, newProductData);
            currentProducts.push({ id: newRef.key, ...newProductData });
            countNew++;
          }
        }
      });

      if (countNew > 0 || countUpdate > 0) {
        addLog(`Import thành công: ${countNew} mới, ${countUpdate} cập nhật`, "success");
        alert(`✅ Nhập dữ liệu thành công!\n- Tạo mới: ${countNew} mặt hàng.\n- Cộng dồn số lượng: ${countUpdate} mặt hàng cũ.`);
      } else {
        alert("❌ Không đọc được dữ liệu. Hãy kiểm tra lại file CSV.");
      }

      e.target.value = null;
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleExportExcel = () => {
    if (products.length === 0) {
      alert("Không có dữ liệu trong kho để xuất!");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "STT,Tên linh kiện,Giá tiền (VNĐ),Vị trí,Số lượng tồn,Link Ảnh\n";
    products.forEach((p, index) => {
      csvContent += `${index + 1},"${p.name}",${p.price},"${p.location}",${p.stock},"${p.image}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "BaoCaoTonKho.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Đã xuất báo cáo CSV.", "info");
  };

  const todayOrders = (historyOrders || []).filter(order => {
    return order.completedAt && new Date(order.completedAt).toDateString() === new Date().toDateString();
  });

  const dailyRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const lowStockProducts = products.filter(p => p.stock < 10);
  const recentActivities = [...historyOrders]
    .filter(order => order.completedAt)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 10);

  const hoursToShow = [8, 10, 12, 14, 16, 18, 20];
  const hourlyData = hoursToShow.map(hour => ({
    hour: hour + 'h',
    count: todayOrders.filter(order => {
      const orderHour = new Date(order.completedAt).getHours();
      return orderHour >= hour && orderHour < hour + 2;
    }).length
  }));

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  const handleUpdateStock = (productId, currentStock, delta) => {
    if (!activeDb) return;
    const newStock = Math.max(0, Number(currentStock) + delta);
    const productRef = ref(activeDb, `products/${productId}`);
    update(productRef, { stock: newStock });
    addLog(`Đã cập nhật tồn kho sản phẩm ID ${productId.slice(-4)}`, "info");
  };

const handlePutInLocker = async (cartItem) => {

  // =========================
  // UPDATE LOCKER
  // =========================

  await update(ref(activeDb, 'lockers/box_01'), {
    customer_uid: cartItem.uid || cartItem.userName,
    status: "OCCUPIED",
    command: "IDLE"
  });

  // =========================
  // CẬP NHẬT STATUS TRƯỚC
  // =========================

  const updatePath =
    cartItem.cartKey !== cartItem.uid
      ? `carts/${cartItem.uid}/${cartItem.cartKey}`
      : `carts/${cartItem.uid}`;

  await update(ref(activeDb, updatePath), {
    status: "Đã vào tủ - Mời lấy hàng"
  });

  // =========================
  // CHUYỂN SANG HISTORY
  // =========================

  await completeOrder(
    {
      ...cartItem,
      status: "Đã vào tủ - Mời lấy hàng"
    },
    "Đã bỏ vào Smart Locker"
  );

  addLog(
    `Đã mở tủ Locker cho đơn hàng của ${cartItem.userName}`,
    "success"
  );

  alert("✅ Đã chuyển đơn hàng vào tủ Locker!");
};
   


const completeOrder = async (cartItem, finalStatus) => {
  const updatePath =
    cartItem.cartKey !== cartItem.uid
      ? `carts/${cartItem.uid}/${cartItem.cartKey}`
      : `carts/${cartItem.uid}`;

  const historyRef = push(ref(activeDb, 'history'));

  await set(historyRef, {
    ...cartItem,
    status: finalStatus,
    completedAt: Date.now()
  });

  await remove(ref(activeDb, updatePath));

  addLog(`Đã hoàn tất đơn của ${cartItem.userName}`, "success");
};


const handleCallPager = async (cartItem) => {
  try {
    const realTotal = (cartItem.items || []).reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    );

    const waitingOrdersForDisplay = waitingCarts
      .filter(c => c.cartKey !== cartItem.cartKey)
      .map(c => ({
        queue_no: c.queue_no || c.id?.slice(-4) || "000",
        userName: c.userName || "Khách hàng",
        status: c.status || "Đang chờ xử lý"
      }));

    const doneHistoryForDisplay = historyOrders.slice(0, 5).map(o => ({
      queue_no: o.queue_no || o.id?.slice(-4) || "000",
      userName: o.userName || "Khách hàng"
    }));

    const queuePayload = {
      current_order: {
        orderId: cartItem.orderId || cartItem.id || "",
        queue_no: cartItem.queue_no || cartItem.id?.slice(-4) || "000",
        userName: cartItem.userName || "Khách hàng",
        status: "Mời quý khách đến nhận hàng tại quầy!",
        totalPrice: realTotal,
        items: cartItem.items || [],
        timestamp: Date.now()
      },
      waiting_orders: waitingOrdersForDisplay,
      done_history: doneHistoryForDisplay,
      timestamp: serverTimestamp()
    };

    await set(ref(activeDb, `queue_display`), queuePayload);
    

    const updatePath =
      cartItem.cartKey !== cartItem.uid
        ? `carts/${cartItem.uid}/${cartItem.cartKey}`
        : `carts/${cartItem.uid}`;

    await completeOrder(cartItem, "Đã gọi khách ra quầy");

    addLog(`Đã phát tín hiệu đồng bộ cấu trúc lên bảng LED cho ${cartItem.userName}`, "success");
    alert(`Đã gọi khách ${cartItem.userName} lên bảng thông báo tại quầy!`);
  } catch (e) {
    console.error("Lỗi đồng bộ bảng LED: ", e);
  }
};

  const startShipping = (cartItem) => {
    const updatePath = cartItem.cartKey !== cartItem.uid ? `carts/${cartItem.uid}/${cartItem.cartKey}` : `carts/${cartItem.uid}`;
    update(ref(activeDb, updatePath), {
      status: "Đang giao hàng (Shipper lấy)"
    });
    addLog(`Trạng thái: Shipper đang giao đơn cho ${cartItem.userName}`, "info");
    alert("Đã cập nhật trạng thái giao hàng!");
  };

  // =======================================================================
  // HIỂN THỊ LỖI NẾU MẤT KẾT NỐI
  // =======================================================================
  if (!activeDb) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="bg-white border border-slate-200 shadow-xl p-12 rounded-[3rem] max-w-2xl relative z-10">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-rose-50 border border-rose-100">
            <AlertTriangle className="text-rose-600 drop-shadow-sm" size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">KẾT NỐI BỊ GIÁN ĐOẠN</h1>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed font-medium">
            Hệ thống phát hiện bạn đang chạy code ở máy cá nhân nhưng chưa mở lệnh kết nối kho dữ liệu.
          </p>
          <div className="bg-slate-50 p-8 rounded-[2rem] text-left relative overflow-hidden border border-slate-100">
            <p className="font-black text-blue-600 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
              <Zap size={16} /> Khắc phục trong 5 giây:
            </p>
            <p className="text-slate-700 text-sm mb-4 leading-relaxed font-bold">Vui lòng mở file code, tìm lên <b>dòng số 8</b> và <b>xóa 2 dấu gạch chéo //</b> để kích hoạt dòng lệnh này:</p>
            <code className="block bg-white text-blue-600 p-4 rounded-xl font-mono text-[13px] border border-slate-200 text-center font-bold shadow-sm">
              import {'{'} db {'}'} from '../services/firebase';
            </code>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // COMPONENT CALENDAR GỐC
  // =======================================================================
  const CalendarCard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const dateGrid = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      dateGrid.push({ date: daysInPrevMonth - i, isCurrentMonth: false });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      dateGrid.push({ date: i, isCurrentMonth: true, isToday: isToday });
    }

    const totalCells = dateGrid.length > 35 ? 42 : 35;
    let nextMonthDay = 1;
    while (dateGrid.length < totalCells) {
      dateGrid.push({ date: nextMonthDay++, isCurrentMonth: false });
    }

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mt-6 hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-center mb-6 px-1">
          <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">
            {monthNames[month]} {year}
          </h4>
          <div className="flex gap-4">
            <button onClick={handlePrevMonth} className="p-2.5 bg-slate-50 rounded-xl transition-all text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-100"><ArrowLeft size={16} strokeWidth={2.5} /></button>
            <button onClick={handleNextMonth} className="p-2.5 bg-slate-50 rounded-xl transition-all text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-100"><ArrowRight size={16} strokeWidth={2.5} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {days.map(day => (
            <span key={day} className="text-[10px] font-black text-slate-400 tracking-tighter">{day}</span>
          ))}
          {dateGrid.map((item, idx) => {
            return (
              <div key={idx} className="relative flex justify-center items-center h-10 w-10 mx-auto">
                <span className={`text-[12px] font-black relative z-10 transition-colors duration-300 ${item.isToday ? 'text-blue-600' : !item.isCurrentMonth ? 'text-slate-400 opacity-40' : 'text-slate-700'}`}>
                  {item.date}
                </span>
                {item.isToday && (
                  <motion.div layoutId="todayHighlight" className="absolute inset-0 bg-blue-50 rounded-[1rem] scale-90 border border-blue-100" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin-block: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(148, 163, 184, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(148, 163, 184, 0.4);
          }
          .custom-scrollbar-activity::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar-activity::-webkit-scrollbar-track {
            background: transparent;
            margin-block: 8px;
          }
          .custom-scrollbar-activity::-webkit-scrollbar-thumb {
            background-color: rgba(148, 163, 184, 0.15);
            border-radius: 10px;
          }
        `}
      </style>

      {/* Tông nền thanh lịch sáng sủa */}
      <div className="w-screen h-screen bg-[#f8fafc] flex items-center justify-center font-sans relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">

        {/* Luồng sáng gradient trang trí chuẩn mẫu ảnh */}
        <div className="absolute top-[-10%] left-[45%] w-[60%] h-[70%] bg-gradient-to-br from-blue-50 to-emerald-50 rounded-full z-0 blur-[120px] pointer-events-none"></div>

        {/* Lớp kính bao bọc */}
        <div className="w-full h-full bg-white/40 backdrop-blur-[20px] border-none flex overflow-hidden z-10 relative">

          {/* SIDEBAR BẢN PRO */}
          <aside className={`flex flex-col py-8 transition-all duration-500 ease-in-out relative z-30 bg-white border-r border-slate-100 flex-shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.01)] ${isCollapsed ? 'w-[84px]' : 'w-[240px]'}`}>
            <div className="flex flex-col items-center justify-center mb-10 transition-all duration-500 w-full mt-2">
              <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`cursor-pointer bg-blue-50/80 p-4 rounded-[1.2rem] border border-blue-100 relative transform transition-all duration-300 hover:scale-105 active:scale-95 ${isCollapsed ? 'scale-90' : ''}`}
              >
                <Activity size={isCollapsed ? 26 : 30} className="text-blue-600" strokeWidth={2.5} />
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div className={`transition-all duration-500 flex flex-col items-center overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-20 opacity-100 mt-5'}`}>
                <span className="text-[11px] font-black tracking-[0.2em] uppercase text-center leading-tight text-slate-800 whitespace-nowrap block">
                  QUẢN TRỊ VIÊN<br />HỆ THỐNG
                </span>
              </div>
            </div>

            <nav className="flex-grow space-y-3 w-full px-4">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'warehouse', icon: Package, label: 'Tồn kho' },
                { id: 'customers', icon: Users, label: 'Đơn Hàng Live' },
                { id: 'locker', icon: ShieldCheck, label: 'Smart Locker' },
                { id: 'reports', icon: Activity, label: 'Báo cáo' },
                { id: 'settings', icon: Settings, label: 'Cài đặt' }

              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex items-center transition-all duration-300 rounded-2xl font-black relative overflow-hidden ${isCollapsed ? 'w-[52px] h-[52px] mx-auto justify-center px-0' : 'w-full px-5 py-3.5'
                    } ${activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-blue-600 border border-transparent'
                    }`}
                >
                  {activeTab === item.id && !isCollapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-400 rounded-l-full"></div>
                  )}
                  <item.icon size={20} className={`shrink-0 transition-transform ${activeTab === item.id ? 'scale-110 stroke-[2.5px]' : 'group-hover:scale-110 stroke-2'}`} />
                  <span className={`whitespace-nowrap text-sm text-left transition-all duration-500 opacity-100 ${isCollapsed ? 'hidden' : 'ml-4'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            <div className="px-4 mt-auto">
              <button onClick={onLogout} className={`group flex items-center transition-all duration-300 rounded-2xl font-black bg-transparent border border-transparent hover:bg-rose-50 text-slate-500 hover:text-rose-600 ${isCollapsed ? 'w-[52px] h-[52px] mx-auto justify-center px-0' : 'w-full px-5 py-4'
                }`}>
                <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform stroke-2" />
                <span className={`whitespace-nowrap text-sm text-left transition-all duration-500 opacity-100 ${isCollapsed ? 'hidden' : 'ml-4'}`}>
                  Thoát
                </span>
              </button>
            </div>
          </aside>

          {/* NỘI DUNG CHÍNH */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* ================= MODERN HEADER LAYOUT ================= */}
            <header className="px-10 xl:px-14 py-6 z-50 shrink-0 relative">
              <div className="flex justify-between items-center max-w-[1600px] mx-auto">

                {/* 1. KHỐI TRÁI: Thương hiệu / Breadcrumb */}
                <div className="w-[200px] flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Activity size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[14px] font-black text-slate-900 uppercase tracking-tighter">AIoT Retail</span>
                    <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Dashboard Pro</span>
                  </div>
                </div>

                {/* 2. KHỐI GIỮA: THANH SEARCH TẬP TRUNG */}
                <div className="flex-1 max-w-[650px] relative group px-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />

                  <div className="relative flex items-center">
                    <div className="absolute left-5 flex items-center gap-2 text-slate-400">
                      {isLoading ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <Search size={18} />}
                      <div className="w-[1px] h-4 bg-slate-200" />
                    </div>

                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDownAI}
                      placeholder="Hỏi AI phân tích kho, hoặc tìm linh kiện (Ctrl + K)..."
                      className="w-full bg-white border border-slate-200 py-4 pl-14 pr-32 rounded-2xl text-[14px] font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-0 transition-all outline-none"
                    />

                    <div className="absolute right-2 flex items-center gap-2">
                      <div className="hidden sm:block text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                        <Command size={10} className="inline mr-1" /> K
                      </div>
                      <button
                        onClick={handleAskAI}
                        disabled={isLoading || !searchTerm.trim()}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-95 shadow-sm shadow-blue-500/10"
                      >
                        Hỏi AI
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. KHỐI PHẢI: USER & NOTIFICATION */}
                <div className="w-[200px] flex items-center justify-end gap-4">
                  <button
                    onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                    className="relative p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all group"
                  >
                    <Bell size={18} className="text-slate-600 group-hover:text-blue-600 transition-colors" strokeWidth={2.5} />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotiDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-[calc(100%+15px)] right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[110] overflow-hidden"
                      >
                        <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Thông báo ({notifications.length})</span>
                          <button onClick={() => setNotifications([])} className="text-[9px] font-bold text-blue-600 hover:underline uppercase">Xóa hết</button>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar-activity p-2">
                          {notifications.length > 0 ? notifications.map(n => (
                            <div key={n.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-all mb-1 border border-transparent hover:border-slate-100 text-left">
                              <p className="text-[11px] font-black text-slate-900 uppercase mb-1">{n.title}</p>
                              <p className="text-[10px] font-medium text-slate-600 leading-relaxed">{n.message}</p>
                            </div>
                          )) : (
                            <div className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Không có thông báo mới</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all cursor-pointer hover:border-slate-300">
                    <img src="https://i.pravatar.cc/150?img=68" alt="admin" className="w-9 h-9 rounded-xl object-cover border border-slate-100 shadow-sm" />
                    <div className="hidden xl:flex flex-col text-left">
                      <span className="font-black text-[12px] text-slate-900 leading-tight">Quản lý</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Admin Station</span>
                    </div>
                  </div>
                </div>

              </div>

{/* ======================= MODAL BÁO CÁO AI ======================= */}

<AnimatePresence>
  {showDropdown && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowDropdown(false)}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[998]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed top-6 bottom-6 left-1/2 -translate-x-1/2 w-[92vw] max-w-[1100px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 z-[999] overflow-hidden flex flex-col"
      >
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Activity size={20} className="text-white" strokeWidth={2.5} />
            </div>

            <div className="text-left">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-0.5 text-white">
                COO Assistant
              </h4>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">
                Chiến lược cung ứng v2.5
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDropdown(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                AI COO đang phân tích dữ liệu...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      AI Inventory Summary
                    </p>

                    <h2 className="text-[24px] font-black text-slate-900 mt-1">
                      Tổng Quan Tồn Kho
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity size={24} className="text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                      Risk Items
                    </p>

                    <h3 className="text-[30px] font-black text-slate-900 mt-2">
                      {inventorySummary?.riskItems || 0}
                    </h3>
                  </div>

                  <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
                    <p className="text-[10px] uppercase tracking-widest text-rose-400 font-black">
                      Critical
                    </p>

                    <h3 className="text-[30px] font-black text-rose-600 mt-2">
                      {inventorySummary?.criticalItems || 0}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <p className="text-[14px] leading-7 text-slate-700 font-medium">
                    {quickMessage}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-blue-400 font-black">
                      AI COO ANALYSIS
                    </p>

                    <h3 className="text-[20px] font-black text-slate-900">
                      Báo Cáo Chiến Lược
                    </h3>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-[15px] leading-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 rounded-2xl border border-slate-200">
                          <table className="w-full text-sm" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-slate-100 text-slate-800" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th
                          className="border border-slate-200 px-4 py-3 text-left font-black"
                          {...props}
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td
                          className="border border-slate-200 px-4 py-3 align-top"
                          {...props}
                        />
                      ),
                      tr: ({ node, ...props }) => (
                        <tr className="bg-white hover:bg-slate-50" {...props} />
                      ),
                    }}
                  >
                    {aiResult || "AI chưa có báo cáo."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          <button className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            Xuất PDF
          </button>

          <button
            onClick={() => {
              setSearchTerm("Phân tích tồn kho hôm nay và đề xuất chiến lược cho Admin");
              handleAskAI();
            }}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-blue-700 shadow-md shadow-blue-500/10"
          >
            Duyệt chiến lược
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
            </header>

            <div className="flex-1 overflow-y-auto px-10 xl:px-14 pb-10 pt-4 custom-scrollbar z-10">

{/* ========================================================================================= */}
              {/* TAB 1: BẢNG ĐIỀU KHIỂN                                                                    */}
              {/* ========================================================================================= */}
              {activeTab === 'dashboard' ? (
                <div className="animate-in fade-in duration-500 text-left pb-10">
                  <div className="flex items-center gap-4 mb-8">
                    <Sparkles className="text-blue-600 animate-pulse" size={36} />
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Core Metrics</h2>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* KHỐI TRÁI */}
                    <div className="xl:col-span-2 space-y-8">
                      {/* Thống kê & Phản hồi */}
                      <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-1 transition-all h-[280px] group">
                          <div className="flex justify-between items-start text-left"><p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] w-1/2 leading-tight">Linh kiện đang quản lý</p><h3 className="text-6xl font-black text-slate-900 tracking-tighter">{products.length}</h3></div>
                          <div className="flex justify-center"><div className="w-32 h-32 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100"><Package className="text-blue-600" size={48} strokeWidth={2.5} /></div></div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-[280px] flex flex-col">
                          <div className="flex justify-between items-center mb-8 px-1"><h4 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-3"><MessageSquare size={20} className="text-emerald-600" strokeWidth={2.5} /> Phản hồi Online</h4><span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-100">MỚI NHẤT</span></div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {[
                              { id: 1, u: "Trần An", r: 5, c: "ESP32 chất lượng rất tốt, hàn chân đẹp.", t: "10p trước", a: "https://i.pravatar.cc/150?img=11" },
                              { id: 2, u: "Hải Ngọc", r: 4, c: "Giao hàng nhanh, linh kiện đóng gói kỹ.", t: "1h trước", a: "https://i.pravatar.cc/150?img=5" }
                            ].map(rv => (
                              <div key={rv.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:bg-blue-50/40 transition-all">
                                <div className="flex justify-between items-start mb-3"><div className="flex gap-3 items-center"><img src={rv.a} className="w-10 h-10 rounded-lg object-cover border border-slate-200" /><div className="flex flex-col text-left leading-none"><span className="text-[12px] font-black uppercase text-slate-900">{rv.u}</span><span className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{rv.t}</span></div></div><div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < rv.r ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} />)}</div></div>
                                <p className="text-[12.5px] font-medium text-slate-600 italic line-clamp-2 leading-relaxed">"{rv.c}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Biểu đồ Khung giờ */}
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                        <div className="flex justify-between items-center mb-12 px-1 text-left">
                          <div className="flex flex-col"><h4 className="font-black text-slate-900 text-sm uppercase tracking-[0.2em]">Đơn hàng theo khung giờ</h4><p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Live Activity Tracker</p></div>
                          <div className="bg-blue-50 px-6 py-2.5 rounded-xl flex items-center gap-3 border border-blue-100"><TrendingUp className="text-blue-600" size={18} strokeWidth={3} /><span className="text-[11px] font-black uppercase tracking-widest text-blue-600">Analytics</span></div>
                        </div>
                        <div className="flex items-end justify-between h-56 gap-6 px-4">
                          {hourlyData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                              {d.count > 0 && <motion.span initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] font-black text-blue-600 mb-3 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">{d.count}</motion.span>}
                              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.count / maxCount) * 100}%` || '8%' }} transition={{ duration: 1, delay: i * 0.1 }} className="w-full max-w-[40px] bg-blue-600 rounded-t-lg group-hover:bg-emerald-500 transition-all shadow-sm shadow-blue-500/10" />
                              <div className="w-full h-[1px] bg-slate-100"></div>
                              <span className="text-[10px] font-black text-slate-500 mt-4 uppercase group-hover:text-blue-600 transition-colors">{d.hour}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cảnh báo tồn kho + Nhật ký hoạt động */}
                      <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-[380px]">
                          <div className="flex justify-between items-center mb-8 px-1">
                            <h4 className="font-black text-rose-600 text-[13px] uppercase tracking-[0.2em] flex items-center gap-3"><AlertTriangle size={20} className="animate-pulse" strokeWidth={3} /> Cảnh báo tồn kho</h4>
                            <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-4 py-1.5 rounded-lg border border-rose-100 uppercase tracking-widest">{lowStockProducts.length} Món sắp hết</span>
                          </div>
                          <div className="overflow-y-auto custom-scrollbar-activity pr-2">
                            <div className="flex flex-col gap-3">
                              {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100 hover:bg-rose-50/50 transition-all group/item">
                                  <div className="flex items-center gap-4">
                                    <div className="p-1 rounded-lg bg-white border border-slate-200"><img src={p.image} className="w-10 h-10 rounded-lg object-cover group-hover/item:scale-105 transition-transform" alt="" /></div>
                                    <div className="flex flex-col text-left gap-0.5">
                                      <span className="text-[13px] font-black text-slate-900 uppercase tracking-tighter leading-tight">{p.name}</span>
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">VỊ TRÍ: {p.location}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[12px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 flex items-center gap-2 leading-none uppercase">
                                      <span className="text-[8px] opacity-60">Còn</span> {p.stock}
                                    </span>
                                  </div>
                                </div>
                              )) : <div className="flex flex-col items-center justify-center py-20 opacity-40"><Package size={48} strokeWidth={1} className="mb-4 text-slate-400" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Kho hàng an toàn</span></div>}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-[380px]">
                          <div className="flex justify-between items-center mb-8 px-1">
                            <h4 className="font-black text-slate-900 text-[13px] uppercase tracking-[0.2em] flex items-center gap-3"><Clock size={20} className="text-emerald-600" strokeWidth={3} /> Nhật ký hoạt động</h4>
                            <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">Thời gian thực</div>
                          </div>
                          <div className="overflow-y-auto custom-scrollbar-activity pr-2 space-y-3">
                            {recentActivities.length > 0 ? recentActivities.map((o, i) => (
                              <div key={i} className="flex gap-4 items-center py-3.5 px-5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50/40 transition-all group/item">
                                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-[12px] font-black text-slate-500 transition-all group-hover/item:text-emerald-600">{(i + 1).toString().padStart(2, '0')}</div>
                                <div className="flex flex-col flex-1 text-left min-w-0">
                                  <p className="text-[14px] font-black text-slate-900 leading-none mb-1 truncate uppercase tracking-tighter">{o.userName || 'Khách hàng'}</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Đã mua {o.items?.length || 1} linh kiện</p>
                                </div>
                                <div className="flex flex-col items-end shrink-0 gap-1">
                                  <span className="text-[14px] font-black text-emerald-600 tracking-tighter">+{Number(o.totalPrice || 0).toLocaleString()}Đ</span>
                                  <span className="text-[8px] font-black text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 uppercase tracking-tighter shadow-sm">
                                    {new Date(o.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </span>
                                </div>
                              </div>
                            )) : <div className="flex flex-col items-center justify-center py-20 opacity-40"><Activity size={48} strokeWidth={1} className="mb-4 text-slate-400" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Chưa có giao dịch</span></div>}
                          </div>
                        </div>
                      </div>

                      {/* Terminal Log */}
                      <div className="bg-slate-900 p-7 rounded-[2.5rem] border border-slate-800 h-[300px] flex flex-col text-left shadow-xl">
                        <div className="flex justify-between items-center mb-6 px-1 border-b border-slate-800 pb-4">
                          <h4 className="font-black text-emerald-400 text-[13px] uppercase tracking-[0.2em] flex items-center gap-3"><Terminal size={20} /> System Terminal Log</h4>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar-activity pr-2 space-y-3 font-mono text-xs">
                          {systemLogs.length > 0 ? systemLogs.map((log, i) => (
                            <div key={i} className="flex gap-4">
                              <span className="opacity-40 text-slate-500">{log.time}</span>
                              <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-blue-400'}>
                                [{log.type.toUpperCase()}] {log.msg}
                              </span>
                            </div>
                          )) : <div className="text-slate-500">Hệ thống đang hoạt động ổn định...</div>}
                        </div>
                      </div>
                      
                    </div>

                    {/* KHỐI PHẢI */}
                    <div className="flex flex-col gap-8 h-full">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center hover:-translate-y-1 transition-all relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="relative z-10 text-left">
                          <p className="text-[11px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">Doanh thu hôm nay</p>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{dailyRevenue.toLocaleString()}đ</h3>
                        </div>
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 relative z-10 group-hover:rotate-6 transition-all"><DollarSign size={32} className="text-blue-600" strokeWidth={3} /></div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "ĐƠN CHỜ", value: waitingCarts.length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                          { label: "HÔM NAY", value: todayOrders.length, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                          { label: "CẢNH BÁO", value: lowStockProducts.length, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" }
                        ].map(m => (
                          <div key={m.label} className={`p-4 rounded-xl border ${m.border} ${m.bg} text-center transition-all shadow-sm`}>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none">{m.label}</p>
                            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                        <h4 className="text-slate-900 font-black text-[12px] uppercase tracking-widest mb-8 text-left flex items-center gap-3 px-1">
                          <Zap size={18} className="text-blue-600" strokeWidth={3} /> TRẠNG THÁI HỆ THỐNG
                        </h4>
                        <div className="space-y-8 px-1">
                          {[
                            { label: 'Đồng bộ Database', val: '98%', color: '#2563eb' },
                            { label: 'Độ trễ Mạng', val: '92%', color: '#059669' }
                          ].map((item, i) => (
                            <div key={i} className="text-left">
                              <div className="flex justify-between text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest"><span>{item.label}</span> <span>{item.val}</span></div>
                              <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
                                <motion.div initial={{ width: 0 }} animate={{ width: item.val }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full rounded-full relative shadow-sm" style={{ backgroundColor: item.color }}></motion.div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <CalendarCard />

                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mt-auto hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-5 mb-10 text-left">
                          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100"><Users className="text-blue-600" size={28} strokeWidth={2.5} /></div>
                          <div className="flex flex-col gap-0.5"><p className="font-black text-slate-900 text-xl tracking-tighter leading-none uppercase">Admin Station</p><p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Master Control Center</p></div>
                        </div>
                        <button onClick={onLogout} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-5 rounded-xl text-[11px] transition-all duration-300 uppercase tracking-[0.3em] border border-rose-100 flex items-center justify-center gap-3 leading-none shadow-sm">
                          <LogOut size={16} /> ĐĂNG XUẤT HỆ THỐNG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'warehouse' ? (
                /* ========================================================================================= */
                /* TAB 2: QUẢN LÝ KHO                                                                        */
                /* ========================================================================================= */
                <div className="animate-in fade-in duration-500 text-left pb-10">
                  <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8 text-left">
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Quản lý kho linh kiện</h2>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {/* TÍNH NĂNG MỚI: Thanh tìm kiếm nội bộ Tab Kho */}
                      <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                          <Search size={16} />
                        </span>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tìm nhanh linh kiện..."
                          className="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 transition-all shadow-sm"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* 1. Bộ lọc danh mục */}
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)} 
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest outline-none cursor-pointer shadow-sm"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>

                      {/* 2. Nút gạt ưu tiên hiển thị hàng sắp hết */}
                      <button 
                        onClick={() => setSortByLowStock(!sortByLowStock)} 
                        className={`px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest border transition-all flex items-center gap-2 shadow-sm ${
                          sortByLowStock 
                            ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-500/5' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                        title="Đẩy các mặt hàng có số lượng tồn kho thấp lên đầu bảng"
                      >
                        <AlertTriangle size={15} className={sortByLowStock ? "animate-pulse" : ""} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Ưu tiên:</span> {sortByLowStock ? "Tồn thấp" : "Mặc định"}
                      </button>

                      {/* 3. Chuyển đổi View Mode */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
                        <button 
                          onClick={() => setViewMode('table')} 
                          className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' : 'text-slate-500 hover:text-slate-900'}`}
                          title="Giao diện bảng chi tiết"
                        >
                          <List size={18} />
                        </button>
                        <button 
                          onClick={() => setViewMode('grid')} 
                          className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' : 'text-slate-500 hover:text-slate-900'}`}
                          title="Giao diện dạng thẻ"
                        >
                          <LayoutGrid size={18} />
                        </button>
                      </div>

                      {/* 4. Thao tác Excel */}
                      <button 
                        onClick={handleExportExcel} 
                        className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-3.5 rounded-2xl font-black flex items-center gap-2 transition-all text-[11px] uppercase tracking-widest hover:bg-blue-100 shadow-sm"
                      >
                        <Download size={16} strokeWidth={3} /> <span className="hidden md:inline">Export</span>
                      </button>
                      
                      <label className="bg-white border border-slate-200 text-slate-700 px-4 py-3.5 rounded-2xl font-black flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest hover:text-blue-600 shadow-sm">
                        <FileSpreadsheet size={16} className="text-emerald-600" strokeWidth={3} /> <span className="hidden md:inline">Import</span>
                        <input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleImportExcel} />
                      </label>
                    </div>
                  </header>

                  {/* ======================================================================= */}
                  {/* CẢI TIẾN UX: KHU VỰC FORM THÊM MỚI (DẠNG THU GỌN)                       */}
                  {/* ======================================================================= */}
                  <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 transition-all duration-300">
                    <div 
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex justify-between items-center cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${showAddForm ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                          <Plus size={18} strokeWidth={3} className={`transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em] m-0 text-left">
                            Thêm linh kiện mới
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 m-0 mt-0.5 text-left">
                            {showAddForm ? "Điền thông tin bên dưới để nhập vào hệ thống" : "Nhấn để mở form nhập liệu nhanh"}
          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 group-hover:underline">
                        {showAddForm ? "Thu gọn ▲" : "Mở form ▼"}
                      </span>
                    </div>

                    {/* Nội dung form xổ ra */}
{showAddForm && (
                      <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-300">
                        
                        <input type="text" placeholder="Tên linh kiện *" className="p-3.5 bg-slate-50 rounded-xl outline-none text-xs font-black text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        
                        {/* Ô CHỌN DANH MỤC ĐÃ ĐƯỢC ĐỒNG BỘ CSS & STATE */}
                        <select 
                          value={formData.category || 'Vi điều khiển'} 
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="p-3.5 bg-slate-50 rounded-xl outline-none text-xs font-black text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="Vi điều khiển">Vi điều khiển</option>
                          <option value="Cảm biến">Cảm biến</option>
                          <option value="Module Rời">Module Rời</option>
                          <option value="Màn hình">Màn hình</option>
                          <option value="Phụ kiện">Phụ kiện</option>
                        </select>

                        <input type="number" placeholder="Giá tiền (đ) *" className="p-3.5 bg-slate-50 rounded-xl outline-none text-xs font-black text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white transition-all" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                        <input type="text" placeholder="Vị trí kho *" className="p-3.5 bg-slate-50 rounded-xl outline-none text-xs font-black text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white transition-all" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                        <input type="number" placeholder="Số lượng *" className="p-3.5 bg-slate-50 rounded-xl outline-none text-xs font-black text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white transition-all" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                        <input type="text" placeholder="Link Ảnh (Tùy chọn)" className="p-3.5 bg-slate-50 rounded-xl outline-none text-xs font-black text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white transition-all" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                        
                        {/* Nút xác nhận nay kéo dài 3 cột (md:col-span-3) */}
                        <button type="submit" className="md:col-span-3 bg-blue-600 text-white font-black py-3.5 rounded-xl hover:bg-blue-700 transition-all uppercase text-[11px] tracking-widest shadow-md shadow-blue-500/10 active:scale-[0.99]">
                          Xác nhận thêm vào hệ thống
                        </button>
                      </form>
                    )}
                    
                  </div>

                  {/* ======================================================================= */}
                  {/* DANH SÁCH HIỂN THỊ                                                      */}
                  {/* ======================================================================= */}
                  {viewMode === 'table' ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden text-left py-2 transition-all">
                      <div className="max-h-[550px] overflow-y-auto custom-scrollbar text-left px-4">
                        <table className="w-full text-left border-separate border-spacing-y-2.5">
                          <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 bg-white/95 backdrop-blur-md z-20 rounded-xl border-b border-slate-100">
                            <tr>
                              <th className="py-3 pl-6 rounded-l-xl w-20">Ảnh</th>
                              <th className="py-3 px-3">Tên linh kiện</th>
                              <th className="py-3 px-3 w-28">Giá tiền</th>
                              <th className="py-3 px-3 w-24">Vị trí</th>
                              <th className="py-3 px-3 text-center w-36">Tồn kho</th>
                              <th className="py-3 pr-6 text-right rounded-r-xl w-20">Xóa</th>
                            </tr>
                            
                          </thead>
                          <tbody className="text-left">
                            {filteredProducts.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="p-16 text-center">
                                  <Package size={48} className="mx-auto mb-4 text-slate-300 stroke-1" />
                                  <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Kho hàng trống</p>
                                  <p className="text-[11px] mt-1 text-slate-400 font-medium">Không tìm thấy linh kiện phù hợp với bộ lọc hiện tại</p>
                                </td>
                              </tr>
                            ) : (
                              filteredProducts.map((p) => (
                                <tr key={p.id} className="group hover:bg-slate-50/60 transition-colors cursor-pointer">
                                  {/* CẢI TIẾN UX: Tối ưu padding (py-2 px-3) giúp hiển thị được nhiều dòng hơn */}
                                  <td className="py-2 pl-6 rounded-l-xl border-y border-l border-transparent group-hover:border-slate-100">
                                    <img src={p.image} className="w-11 h-11 rounded-lg object-cover border border-slate-200 shadow-2xs" alt="" />
                                  </td>
                                  <td className="py-2 px-3 font-black text-slate-900 text-xs uppercase tracking-tight border-y border-transparent group-hover:border-slate-100">
                                    {p.name}
                                  </td>
                                  <td className="py-2 px-3 font-black text-blue-600 text-xs border-y border-transparent group-hover:border-slate-100">
                                    {Number(p.price).toLocaleString()}đ
                                  </td>
                                  <td className="py-2 px-3 font-bold text-slate-500 text-[10px] tracking-widest uppercase border-y border-transparent group-hover:border-slate-100">
                                    {p.location}
                                  </td>
                                  <td className="py-2 px-3 text-center border-y border-transparent group-hover:border-slate-100">
                                    <div className="flex items-center justify-center gap-2 bg-slate-50 group-hover:bg-white p-1 rounded-xl border border-slate-200/80 inline-flex shadow-2xs">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStock(p.id, p.stock, -1); }}
                                        className="w-6 h-6 flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all text-slate-500 border border-slate-100 shadow-2xs"
                                      >
                                        <div className="w-2 h-[2px] bg-current rounded-full" />
                                      </button>
                                      <span className={`min-w-[24px] font-black text-xs ${p.stock < 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                                        {p.stock}
                                      </span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStock(p.id, p.stock, 1); }}
                                        className="w-6 h-6 flex items-center justify-center bg-white hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all text-slate-500 border border-slate-100 shadow-2xs"
                                      >
                                        <Plus size={12} strokeWidth={3} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-2 pr-6 text-right rounded-r-xl border-y border-r border-transparent group-hover:border-slate-100">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); remove(ref(activeDb, `products/${p.id}`)); }}
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-lg"
                                      title="Xóa linh kiện"
                                    >
                                      <Trash2 size={16} strokeWidth={2.5} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {filteredProducts.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all group relative flex flex-col justify-between">
                          <div>
                            <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative bg-slate-50 border border-slate-100">
                              <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                              <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg font-black text-[9px] shadow-sm backdrop-blur-md ${p.stock < 10 ? 'bg-rose-500/90 text-white animate-pulse' : 'bg-white/90 text-blue-600'}`}>
                                {p.stock} pcs
                              </div>
                            </div>
                            <h5 className="font-black text-slate-900 text-xs uppercase tracking-tight mb-1 line-clamp-1">{p.name}</h5>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vị trí: {p.location}</p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                            <span className="font-black text-blue-600 text-xs">{Number(p.price).toLocaleString()}đ</span>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleUpdateStock(p.id, p.stock, 1)} 
                                className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-2xs"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => remove(ref(activeDb, `products/${p.id}`))} 
                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors border border-rose-100 shadow-2xs"
                              >
                                <Trash2 size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === 'customers' ? (
                /* ========================================================================================= */
                /* TAB 3: KHÁCH HÀNG                                                                         */
                /* ========================================================================================= */
                <div className="animate-in fade-in duration-500 text-left pb-10">
                  <header className="mb-8 text-left">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Live Tracking Khách Hàng</h2>
                    <p className="text-slate-500 font-black text-xs mt-1.5 uppercase tracking-widest">Theo dõi hoạt động mua sắm thời gian thực</p>
                  </header>

                  

                  {/* BỘ LỌC TAB ĐƠN HÀNG */}
                  <div className="flex gap-4 mb-6">
                    {['Tất cả', 'Chờ xử lý', 'Sẵn sàng'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setOrderStatusTab(tab)}
                        className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase transition-all shadow-sm ${orderStatusTab === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="w-full overflow-hidden text-left">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      <table className="w-full min-w-full text-left border-separate border-spacing-y-4">
                        <thead className="text-slate-500 text-[10px] font-black uppercase tracking-widest sticky top-0 z-20 bg-white backdrop-blur-md rounded-xl border-b border-slate-100">
                          <tr>
                            <th className="p-5 pl-10 rounded-l-xl">Khách hàng</th>
                            <th className="p-5">Chi tiết giỏ hàng</th>
                            <th className="p-5 text-center pr-10 rounded-r-xl">Trạng thái & Lệnh</th>
                          </tr>
                        </thead>
                        <tbody className="text-left">
                          {filteredCarts.length > 0 ? filteredCarts.map((c, index) => (
                            <tr key={index} className="group transition-all">
                              <td className="p-6 pl-10 align-top bg-transparent border-y border-l border-slate-100">
                                <div className="flex items-center gap-5">
                                  <div className="w-16 h-16 bg-white border border-slate-200 text-blue-600 rounded-2xl flex items-center justify-center font-black uppercase text-xl transition-all shadow-sm">{c.userName?.charAt(0)}</div>
                                  <div className="text-left">
                                    <p className="font-black text-slate-900 text-lg uppercase tracking-tighter leading-none mb-2">{c.userName}</p>
                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                                      <Clock size={12} strokeWidth={3} /> {c.time ? new Date(c.time).toLocaleTimeString() : "--:--"}
                                    </p>
                                    {c.id && c.type && (
                                      <p className="text-[9px] text-emerald-600 font-black mt-1.5 uppercase tracking-widest">
                                        #{c.id} ({c.type})
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-6 bg-slate-50 border-y border-slate-100">
                                <div className="bg-white rounded-[2rem] overflow-hidden min-w-[350px] text-left p-2 border border-slate-100 shadow-sm">
                                  <table className="w-full text-left border-separate border-spacing-y-2 px-2 mt-1">
                                    <thead><tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left"><th className="pb-2 pl-3">Linh kiện</th><th className="pb-2 text-center">SL</th><th className="pb-2 pr-3 text-right">Kho</th></tr></thead>
                                    <tbody>
                                      {c.items?.map((item, idx) => (
                                        <tr key={idx} className="text-xs font-black text-slate-700 tracking-tighter text-left">
                                          <td className="py-1.5 pl-3 uppercase text-left">{item.name?.replace(/Ã|Î|©|Â|®/g, '').trim()}</td>
                                          <td className="py-1.5 text-center"><span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-100">{item.qty}</span></td>
                                          <td className="py-1.5 pr-3 text-right text-emerald-600 uppercase font-black">{item.location}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="mt-3 p-4 px-6 rounded-b-[1.5rem] flex justify-between items-center text-left bg-slate-50 border-t border-slate-100">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tổng thanh toán:</span>
                                    <span className="text-xl font-black text-blue-600 tracking-tighter">
                                      {c.items
                                        ?.reduce(
                                          (sum, item) =>
                                            sum + Number(item.price || 0) * Number(item.qty || 0),
                                          0
                                        )
                                        .toLocaleString()}đ
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* CỘT TRẠNG THÁI VÀ NÚT LỆNH */}
                              <td className="p-6 pr-10 text-center align-top pt-8 bg-slate-50 rounded-r-[2rem] border-y border-r border-slate-100 w-[240px]">
                                <div className="flex flex-col items-center gap-3">

                                  {/* 1. HIỂN THỊ TRẠNG THÁI HIỆN TẠI */}
                                  <span className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border w-full text-center tracking-widest shadow-sm
                                    ${c.status === 'Đã thanh toán' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      c.status === 'Tiền mặt (Chưa thu)' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        c.status === 'Đang chọn món' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-white text-slate-700 border-slate-200'}`}>
                                    {c.status || "ĐANG CHỌN MÓN"}
                                  </span>

                                  {/* 2. CÁC NÚT LỆNH */}
                                  {c.type && (
                                    <div className="w-full space-y-2 mt-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Lệnh xử lý</p>

                                      {/* KỊCH BẢN 1: TỦ SMART LOCKER */}
                                      {c.type === 'locker' && (
                                        <button
                                          onClick={() => handlePutInLocker(c)}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 px-3 py-3 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95"
                                        >
                                          Mở tủ Locker
                                        </button>
                                      )}

                                      {/* KỊCH BẢN 2: NHẬN TẠI QUẦY */}
                                      {c.type === 'counter' && (
                                        <div className="flex flex-col gap-2 w-full">
                                          <button onClick={() => handleCallPager(c)} className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-3 py-2 rounded-xl font-black text-[9px] uppercase transition-all active:scale-95">Hiện bảng LED</button>
                                          {c.status !== 'Chờ khách đến lấy' ? (
                                            <button
                                              onClick={async () => {
                                                const updatePath = c.cartKey !== c.uid ? `carts/${c.uid}/${c.cartKey}` : `carts/${c.uid}`;
                                                await update(ref(activeDb, updatePath), { status: "Chờ khách đến lấy" });
                                                await sendSMS(c.phone || "0344881004", c.id?.slice(-4), c.userName);
                                                addLog(`SMS báo lấy hàng đã được gửi tới ${c.userName}`, 'success');
                                                alert(`Đã báo SMS cho ${c.userName}! Khách sẽ đến lấy ngay.`);
                                              }}
                                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 px-3 py-3 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                              <Zap size={14} /> Báo SMS
                                            </button>
                                          ) : (
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center shadow-sm">
                                              <p className="text-[9px] font-black text-emerald-600 uppercase">Đã nhắn SMS - Khách đang tới</p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* KỊCH BẢN 3: GIAO HÀNG XA */}
                                      {c.type === 'shipping' && (
                                        <button
                                          onClick={() => startShipping(c)}
                                          className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 px-3 py-3 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95"
                                        >
                                          Giao hàng xa
                                        </button>
                                      )}

                                      {/* KỊCH BẢN TIỀN MẶT CẦN THU */}
                                      {c.payment_method === 'cash' && c.status === 'Tiền mặt (Chưa thu)' && (
                                        <button
                                          onClick={() => {
                                            const updatePath = c.cartKey !== c.uid ? `carts/${c.uid}/${c.cartKey}` : `carts/${c.uid}`;
                                            update(ref(activeDb, updatePath), { status: "Đã thanh toán" });
                                            addLog(`Đã xác nhận thu tiền mặt cho đơn ${c.cartKey.slice(-4)}`, 'success');
                                          }}
                                          className="w-full border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl font-black text-[9px] uppercase transition-all mt-2 active:scale-95 bg-emerald-50 shadow-sm"
                                        >
                                          Xác nhận thu tiền
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan="3" className="p-24 text-center text-slate-400 font-black uppercase tracking-[0.3em]">Chưa có luồng dữ liệu mới...</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'reports' ? (
                /* ========================================================================================= */
                /* TAB 4: BÁO CÁO TOÀN DIỆN (ĐÃ ĐƯỢC PHÁT TRIỂN HOÀN CHỈNH)                                 */
                /* ========================================================================================= */
                <div className="animate-in fade-in duration-500 text-left pb-10">
                  <header className="mb-8 text-left">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Báo Cáo & Thống Kê</h2>
                    <p className="text-slate-500 font-black text-xs mt-1.5 uppercase tracking-widest">Phân tích hiệu suất kinh doanh và dòng tiền hệ thống</p>
                  </header>

                  {/* 1. KHỐI METRICS TỔNG QUAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full z-0"></div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng doanh thu</p>
                        <h4 className="text-2xl font-black text-blue-600 tracking-tighter">
                          {historyOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0).toLocaleString()}đ
                        </h4>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
                          <TrendingUp size={12} /> Toàn bộ thời gian
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full z-0"></div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đơn thành công</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
                          {historyOrders.filter(o => o.completedAt).length} <span className="text-xs text-slate-400 font-bold">đơn</span>
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">Đã bàn giao qua Locker & Quầy</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full z-0"></div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Định giá kho hàng</p>
                        <h4 className="text-2xl font-black text-purple-600 tracking-tighter">
                          {products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0).toLocaleString()}đ
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">Ước tính theo giá bán lẻ</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full z-0"></div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hiệu suất xử lý</p>
                        <h4 className="text-2xl font-black text-emerald-600 tracking-tighter">99.4%</h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">Hệ thống AIoT ổn định</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. PHÂN TÍCH CHUYÊN SÂU TỪ AI (INVENTORY INSIGHTS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={16} className="text-blue-600" /> Tốc độ tiêu thụ & Cảnh báo chuỗi cung ứng
                        </h3>
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md uppercase">AI Analyzed</span>
                      </div>

                      <div className="space-y-4 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                        {inventoryInsights && inventoryInsights.length > 0 ? inventoryInsights.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${item.isRisk ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase">{item.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Tốc độ bán: <span className="text-blue-600">{item.salesVelocity || 0} sản phẩm/tuần</span></p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.isRisk ? (
                                <span className="text-[9px] font-black px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                                  Hết hàng sau {item.weeksLeft} tuần
                                </span>
                              ) : (
                                <span className="text-[9px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                                  Tồn kho an toàn ({item.weeksLeft} tuần)
                                </span>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-12 text-slate-400 text-xs font-bold">
                            Hệ thống AI đang thu thập thêm dữ liệu giao dịch để đưa ra phân tích...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Khối gợi ý nhanh */}
                    <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={18} className="text-amber-400" />
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">AI Gợi Ý Tối Ưu</span>
                        </div>
                        <h4 className="text-sm font-bold leading-relaxed text-slate-200 mb-4">
                          "Dựa trên lịch sử xuất kho, nhóm <span className="text-white underline font-black">Vi điều khiển</span> đang có chu kỳ quay vòng vốn nhanh nhất. Đề xuất tăng 25% hạn mức nhập hàng cho quý tới."
                        </h4>
                      </div>
                      <button 
                        onClick={() => {
  setSearchTerm("Phân tích tồn kho hôm nay và đề xuất chiến lược cho Admin");
  setTimeout(() => {
    handleAskAI();
  }, 100);
}}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                      >
                        Xuất báo cáo nhập hàng
                      </button>
                    </div>
                  </div>

                  {/* 3. BẢNG CHI TIẾT LỊCH SỬ BÁN HÀNG */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                    <div className="flex justify-between items-center mb-6 px-2">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Sổ Lịch Sử Giao Dịch</h3>
                      <span className="text-xs font-bold text-slate-400">Tổng: {historyOrders.length} đơn</span>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="text-slate-400 text-[9px] font-black uppercase tracking-widest sticky top-0 bg-white z-10">
                          <tr>
                            <th className="pb-3 pl-4">Mã Đơn</th>
                            <th className="pb-3">Khách Hàng</th>
                            <th className="pb-3">Sản Phẩm Đã Mua</th>
                            <th className="pb-3 text-center">Hình Thức</th>
                            <th className="pb-3 text-right pr-4">Tổng Tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyOrders && historyOrders.length > 0 ? historyOrders.map((order, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs font-medium text-slate-700">
                              <td className="py-3 pl-4 font-mono text-slate-400">#{order.id?.slice(-5) || "ORD"}</td>
                              <td className="py-3 font-black text-slate-900 uppercase">{order.userName || "Khách Vãng Lai"}</td>
                              <td className="py-3 max-w-xs truncate text-slate-600 font-bold">
                                {order.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || "Linh kiện AIoT"}
                              </td>
                              <td className="py-3 text-center">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">
                                  {order.type || "Tại Quầy"}
                                </span>
                              </td>
                              <td className="py-3 text-right pr-4 font-black text-blue-600">
                                {Number(order.totalPrice || 0).toLocaleString()}đ
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="5" className="text-center py-10 text-slate-400 font-bold">
                                Chưa có dữ liệu đơn hàng trong lịch sử.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'locker' ? (

  <div className="animate-in fade-in duration-500 text-left pb-10">

    <header className="mb-8 text-left">
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
        Smart Locker
      </h2>

      <p className="text-slate-500 font-black text-xs mt-1.5 uppercase tracking-widest">
        Giám sát trạng thái realtime của hệ thống tủ thông minh
      </p>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

      {Object.entries(lockers).map(([key, locker]) => {

        const status = locker.status || "UNKNOWN";

        return (

          <div
            key={key}
            className={`

              rounded-[2rem]
              p-6
              border
              shadow-sm

              ${

                status === "OCCUPIED"

                  ? "bg-red-50 border-red-200"

                  : status === "OPEN"

                  ? "bg-orange-50 border-orange-200"

                  : "bg-emerald-50 border-emerald-200"
              }

            `}
          >

            <h2 className="font-black text-xl text-slate-900">

              {key.toUpperCase()}

            </h2>

            <p className="mt-3 font-bold">

              {

                status === "OCCUPIED"

                  ? "🔴 Đang có hàng"

                  : status === "OPEN"

                  ? "🟠 Đang mở"

                  : "🟢 Tủ trống"

              }

            </p>

          </div>

        );

      })}

    </div>

  </div>
                
              ) : activeTab === 'settings' ? (
                /* ========================================================================================= */
                /* TAB 5: CÀI ĐẶT HỆ THỐNG                                                                   */
                /* ========================================================================================= */
                <div className="animate-in fade-in duration-500 text-left pb-10">
                  <header className="mb-8 text-left">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Cài Đặt Hệ Thống</h2>
                    <p className="text-slate-500 font-black text-xs mt-1.5 uppercase tracking-widest">Cấu hình Tự động hóa, AI và Bảo mật</p>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Cấu hình Vận hành */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                      <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Settings size={18} className="text-blue-600" /> Tự động hóa & Vận hành
                      </h3>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                          <div>
                            <p className="font-black text-sm text-slate-900 uppercase">Tự động gửi SMS</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">Tự gửi tin nhắn báo khách khi đơn hàng sẵn sàng</p>
                          </div>
                          <div onClick={() => setSettings(p => ({...p, autoSMS: !p.autoSMS}))} className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative shadow-inner ${settings.autoSMS ? 'bg-blue-600' : 'bg-slate-300'}`}>
                            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform" style={{ transform: settings.autoSMS ? 'translateX(26px)' : 'translateX(2px)' }} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                          <div>
                            <p className="font-black text-sm text-slate-900 uppercase">Âm thanh thông báo</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">Phát tiếng "Ping" khi có đơn hàng hoặc cảnh báo mới</p>
                          </div>
                          <div onClick={() => setSettings(p => ({...p, soundEnabled: !p.soundEnabled}))} className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative shadow-inner ${settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform" style={{ transform: settings.soundEnabled ? 'translateX(26px)' : 'translateX(2px)' }} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                          <div className="w-full">
                            <div className="flex justify-between mb-3">
                              <div>
                                <p className="font-black text-sm text-slate-900 uppercase">Ngưỡng cảnh báo tồn kho</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-1">Hệ thống sẽ báo động nếu linh kiện dưới mức này</p>
                              </div>
                              <span className="text-lg font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl h-fit shadow-sm">{settings.stockThreshold}</span>
                            </div>
                            <input type="range" min="1" max="50" value={settings.stockThreshold} onChange={(e) => setSettings(p => ({...p, stockThreshold: e.target.value}))} className="w-full accent-blue-600 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI & Bảo mật */}
                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                        <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Bot size={18} className="text-blue-600" /> AI Copilot Preferences
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div>
                              <p className="font-black text-sm text-slate-900 uppercase">Báo cáo AI tự động</p>
                              <p className="text-[10px] font-bold text-slate-500 mt-1">AI sẽ tổng hợp chiến lược vào lúc 22:00 mỗi ngày</p>
                            </div>
                            <div onClick={() => setSettings(p => ({...p, aiAutoReport: !p.aiAutoReport}))} className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative shadow-inner ${settings.aiAutoReport ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform" style={{ transform: settings.aiAutoReport ? 'translateX(26px)' : 'translateX(2px)' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                        <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
                          <ShieldCheck size={18} /> API & System Integration
                        </h3>
                        <div className="space-y-5 relative z-10">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Firebase Database ID</p>
                              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-mono text-slate-300 truncate w-3/4">{appId}</span>
                                <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg">Connected</span>
                              </div>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gemini AI Engine</p>
                              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-mono text-slate-300">gemini-2.5-flash-pro</span>
                                <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg">Active</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <button 
                      onClick={() => { 
                        addLog("Đã lưu các cấu hình cài đặt hệ thống.", "success"); 
                        alert("✅ Hệ thống đã cập nhật cấu hình mới!"); 
                      }} 
                      className="bg-blue-600 text-white shadow-md shadow-blue-500/10 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
                    >
                      <Settings size={18} /> LƯU CẤU HÌNH HỆ THỐNG
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in flex flex-col items-center justify-center h-[60vh] text-slate-400">
                  <Settings size={64} className="mb-4 animate-[spin_4s_linear_infinite] text-blue-600/30" />
                  <p className="font-black uppercase tracking-widest text-sm opacity-60">Tính năng đang được phát triển...</p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ========================================================================================= */}
        {/* MODAL CẢNH BÁO AI THÔNG MINH                                                              */}
        {/* ========================================================================================= */}
        <AnimatePresence>
          {showStockAlert && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl"
              >
                <div className="p-10 text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 shadow-sm">
                      <AlertTriangle size={28} strokeWidth={2.5} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">AI Inventory Alert</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phân tích dữ liệu 4 tuần qua</p>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
                    AI Copilot phát hiện một số linh kiện có tốc độ bán nhanh và <span className="text-rose-600 underline font-bold">dự kiến sẽ hết sạch</span> trong chưa đầy 2 tuần tới:
                  </p>

                  <div className="space-y-3 mb-8 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {alertItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="font-black text-slate-900 text-xs uppercase">{item.name}</span>
                        <span className="text-[10px] font-black px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                          CÒN {item.weeksLeft} TUẦN
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => {
                      const todayKey = new Date().toISOString().slice(0, 10);
                      localStorage.setItem("stockAlertDismissedDate", todayKey);
                      setShowStockAlert(false);
                    }} className="py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent">Để sau</button>
                    <button onClick={() => { setShowStockAlert(false); handleGetStrategy(); }} className="py-4 bg-blue-600 text-white shadow-md shadow-blue-500/10 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all hover:bg-blue-700">Xem chiến lược nhập</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default App;