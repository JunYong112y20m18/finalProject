"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ReadyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadyOrders = async () => {
      try {
        const res = await fetch("/api/orders/ready"); // 請確認你已建立這個 API
        if (!res.ok) throw new Error("無法取得訂單資料");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        alert("讀取 READY 訂單失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchReadyOrders();
  }, []);

  const handleComplete = async (orderId) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "COMPLETED",
        }),
      });

      if (!res.ok) throw new Error("更新失敗");

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err) {
      alert("完成訂單失敗");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🍱 READY 訂單</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-24 bg-white rounded-lg shadow" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            🎉 目前沒有 READY 訂單
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-pink-600 mb-2">
                  訂單 #{order.id.slice(0, 8)}
                </h2>
                <p className="text-gray-800 font-medium mb-1">
                  顧客：{order.customer?.name || "未知"}
                </p>
                <ul className="text-sm list-disc pl-5 mb-2 space-y-1">
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.menuItem?.name}
                      {item.specialRequest && (
                        <p className="text-xs text-gray-500 ml-4">
                          備註：{item.specialRequest}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500">
                  建立時間：{new Date(order.createdAt).toLocaleString()}
                </p>
                <button
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition"
                  onClick={() => handleComplete(order.id)}
                >
                  ✅ 已交付
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}