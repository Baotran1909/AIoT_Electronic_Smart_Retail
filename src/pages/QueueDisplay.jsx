import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../services/firebase";
import { BellRing, Package, Users, CheckCircle2, Monitor, Clock3, ReceiptText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

const QueueDisplay = () => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [waitingOrders, setWaitingOrders] = useState([]);
  const [doneHistory, setDoneHistory] = useState([]);

  useEffect(() => {
    if (!db) return;

    const queueRef = ref(db, 'queue_display');

    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCurrentOrder(null);
        setWaitingOrders([]);
        setDoneHistory([]);
        return;
      }

      setCurrentOrder(data.current_order || null);
      setWaitingOrders(Array.isArray(data.waiting_orders) ? data.waiting_orders : []);
      setDoneHistory(Array.isArray(data.done_history) ? data.done_history.slice(0, 4) : []);
    });

    return () => unsubscribe();
  }, []);

  const totalItems = useMemo(() => {
    if (!currentOrder?.items) return 0;
    return currentOrder.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }, [currentOrder]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-sky-50 via-violet-50 to-rose-50 p-4 overflow-hidden font-sans text-slate-800">
      <section className="w-full h-full bg-white/90 rounded-[28px] border border-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Monitor size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">AIoT Retail Queue</h1>
              <p className="text-slate-500 text-sm mt-0.5">Hệ thống trạng thái đơn hàng thời gian thực</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl px-4 py-2">
            <BellRing size={19} />
            <span className="font-black text-sm uppercase tracking-wide">Đang phục vụ</span>
          </div>
        </div>

        <div className="flex-1 p-5 grid grid-cols-12 gap-5 min-h-0">
          <div className="col-span-3 rounded-[24px] bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 flex flex-col items-center justify-center text-center px-5 py-6 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentOrder?.queue_no || "empty"}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <p className="uppercase tracking-[0.28em] text-indigo-400 text-xs font-black mb-2">
                  Số thứ tự
                </p>

                <div className="text-[78px] xl:text-[92px] leading-none font-black text-indigo-600">
                  {currentOrder?.queue_no ? `#${currentOrder.queue_no}` : "---"}
                </div>

                <h2 className="text-3xl font-black uppercase mt-3 text-slate-900 break-words">
                  {currentOrder?.userName || "Đang chờ"}
                </h2>

                <p className="text-cyan-600 text-lg font-bold mt-3">
                  {currentOrder?.status || "Chưa có đơn được xác nhận"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="col-span-6 flex flex-col min-h-0">
            <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm flex flex-col h-full min-h-0">
              <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
                <div>
                  <h3 className="font-black text-xl uppercase text-slate-900">Chi tiết đơn hàng</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    {currentOrder?.items?.length || 0} loại linh kiện
                  </p>
                </div>

                <div className="flex gap-2">
                  <MiniStat icon={<Package size={15} />} label="SP" value={totalItems} />
                  <MiniStat icon={<Clock3 size={15} />} label="TG" value="3-5p" />
                  <MiniStat
                    icon={<ReceiptText size={15} />}
                    label="Tổng"
                    value={formatMoney(currentOrder?.totalPrice)}
                    tone="red"
                      />
                </div>
              </div>

              {currentOrder?.items?.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex-1 min-h-0">
                  <div className="grid grid-cols-12 bg-slate-100 px-4 py-2 text-[12px] font-black uppercase text-slate-500 shrink-0">
                    <div className="col-span-8">Tên linh kiện</div>
                    <div className="col-span-2 text-center">SL</div>
                    <div className="col-span-2 text-right">Giá</div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {currentOrder.items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="grid grid-cols-12 px-4 py-2 text-[14px] items-center"
                      >
                        <div className="col-span-8 truncate font-semibold text-slate-800">
                          {item.name}
                        </div>
                        <div className="col-span-2 text-center font-bold text-slate-600">
                          x{item.qty}
                        </div>
                        <div className="col-span-2 text-right font-bold text-indigo-600 whitespace-nowrap">
                          {formatMoney(Number(item.price || 0) * Number(item.qty || 0))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  Chưa có đơn hàng nào.
                </div>
              )}
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-3 mb-3 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Users size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase text-slate-900">Đang chờ</h2>
                  <p className="text-slate-500 text-sm">Có {waitingOrders.length} khách đang chờ</p>
                </div>
              </div>

              <div className="space-y-2 overflow-hidden flex-1">
                {waitingOrders.length > 0 ? (
                  waitingOrders.slice(0, 5).map((order, index) => (
                    <motion.div
                      key={`${order.queue_no || "order"}-${index}`}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-slate-100 rounded-2xl p-2.5 flex items-center justify-between bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase font-black text-slate-400">Khách hàng</p>
                        <p className="font-black text-sm truncate max-w-[135px] mt-0.5 text-slate-900">
                          {order.userName || "Khách hàng"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[135px]">
                          {order.status || "Đang chờ xử lý"}
                        </p>
                      </div>

                      <div className="bg-indigo-500 text-white rounded-xl px-3 py-2 ml-2 shadow-sm">
                        <span className="font-black text-lg">#{order.queue_no || "---"}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-slate-400">
                    <div>
                      <Users size={46} className="mx-auto opacity-40" />
                      <p className="mt-3 font-bold uppercase text-sm">Chưa có khách đang chờ</p>
                    </div>
                  </div>
                )}

                {waitingOrders.length > 5 && (
                  <div className="text-center text-xs font-black text-indigo-500 bg-indigo-50 rounded-xl py-2">
                    + còn {waitingOrders.length - 5} khách đang chờ
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[22px] border border-slate-100 p-4 shadow-sm shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={17} className="text-emerald-500" />
                <h3 className="font-black uppercase text-sm text-slate-500">Đơn vừa hoàn thành</h3>
              </div>

              <div className="space-y-1.5">
                {doneHistory.length > 0 ? (
                  doneHistory.slice(0, 3).map((order, index) => (
                    <div
                      key={`${order.queue_no || "done"}-${index}`}
                      className="bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2 flex items-center justify-between text-sm font-bold"
                    >
                      <span className="truncate max-w-[140px]">{order.userName || "Khách hàng"}</span>
                      <span>#{order.queue_no || "---"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Chưa có đơn hoàn thành.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 shrink-0">
          <span>Vui lòng theo dõi màn hình để nhận đơn hàng.</span>
          <span className="text-emerald-600 font-bold">Firebase Realtime Connected</span>
        </div>
      </section>
    </div>
  );
};

const MiniStat = ({
  icon,
  label,
  value,
  tone = "default",
}) => {

  const styleMap = {
    default:
      "bg-slate-50 border-slate-100 text-slate-400 value:text-slate-900",

    red:
      "bg-gradient-to-br from-red-500 to-rose-500 border-red-400 text-white",

    cyan:
      "bg-cyan-50 border-cyan-100 text-cyan-600 value:text-slate-900",

    indigo:
      "bg-indigo-50 border-indigo-100 text-indigo-600 value:text-slate-900",
  };

  return (
    <div
      className={`min-w-[88px] rounded-2xl px-3 py-2 border ${styleMap[tone]}`}
    >

      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase">
        {icon}
        {label}
      </div>

      <p
        className={`font-black text-sm truncate mt-1 ${
          tone === "red"
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {value || "---"}
      </p>
    </div>
  );
};

export default QueueDisplay;