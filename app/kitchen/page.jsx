"use client";

import { useEffect, useState } from "react";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/kitchen");
        if (!res.ok) {
          alert("取得廚房訂單失敗");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        alert("取得廚房訂單失敗");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCompleteOrder = async (orderId) => {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "READY",
        }),
      });

      if (!res.ok) {
        alert("標記為已完成失敗！");
        return;
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("更新訂單狀態失敗：", error);
      alert("系統錯誤，請稍後再試");
    }
  };

  // 計算訂單總價
  const calcTotalPrice = (items) =>
    items.reduce(
      (sum, item) => sum + (item.menuItem.price ?? 0) * item.quantity,
      0
    );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
        👨‍🍳 廚房訂單看板
      </h1>

      {loading ? (
        <div className="text-center text-gray-500 mt-12 text-lg">讀取中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 mt-12 text-lg">
          暫無待處理訂單 🍳
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 p-6 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    訂單 #{order.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-green-700 font-semibold text-lg">
                  NT$ {calcTotalPrice(order.items).toLocaleString()}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700">
                  餐點內容：
                </h4>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>
                        {item.menuItem.name} × {item.quantity}
                        {item.specialRequest && (
                          <span className="block text-xs text-gray-400">
                            備註：{item.specialRequest}
                          </span>
                        )}
                      </span>
                      <span>
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCompleteOrder(order.id)}
                className="mt-5 w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition"
              >
                ✅ 標記為已完成
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}