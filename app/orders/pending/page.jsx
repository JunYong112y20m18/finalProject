"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PendingOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);

  console.log("Session status:", status);
  console.log("Session data:", session);

  // 狀態文字轉換函數
  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "待處理";
      case "PREPARING":
        return "製作中";
      case "READY":
        return "餐點可領取";
      case "COMPLETED":
        return "交易完成";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    async function fetchOrders() {
      try {
        const userId = session.user.id;
        const res = await fetch(`/api/orders/pending?userId=${userId}`);
        if (!res.ok) throw new Error("獲取訂單失敗");
        if (!res.ok){
            const error = await res.json();
        }
        const data = await res.json();
        setOrders(data);
      } catch {
        alert("獲取待處理訂單失敗");
      }
    }
    fetchOrders();
  }, [session, status]);

  const updateOrderStatus = async (orderId, status) => {
    const res = await fetch("/api/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    if (!res.ok) {
      const error = await res.json();
      alert(`修改訂單狀態失敗: ${error.message}`);
      return null;
    }
    return await res.json();
  };

  const updatePaymentStatus = async (orderId) => {
    const res = await fetch("/api/orders/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      const error = await res.json();
      alert(`確認付款失敗: ${error.message}`);
      return null;
    }
    return await res.json();
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const updated = await updateOrderStatus(orderId, "PREPARING");
      if (updated) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "PREPARING" } : order
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmPayment = async (orderId) => {
    try {
      const updated = await updatePaymentStatus(orderId);
      if (updated) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, paymentStatus: true } : order
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const updated = await updateOrderStatus(orderId, "CANCELLED");
      if (updated) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const updated = await updateOrderStatus(orderId, "COMPLETED");
      if (updated) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const visibleStatuses = ["PENDING", "PREPARING", "READY"];
  const filteredOrders = orders.filter((order) =>
    visibleStatuses.includes(order.status)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
          待處理訂單
        </h1>

        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center sm:text-left">
            目前沒有待處理訂單。
          </p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      訂單 #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-gray-700">
                    <strong>總金額：</strong> ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-gray-700">
                    <strong>訂單狀態：</strong> {getStatusText(order.status)}
                  </p>
                  <p className="text-gray-700">
                    <strong>顧客：</strong> {order.customer.name}
                  </p>
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

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  {!order.paymentStatus && (
                    <button
                      onClick={() => handleConfirmPayment(order.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    >
                      已付款
                    </button>
                  )}

                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      接受訂單
                    </button>
                  )}

                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  >
                    取消訂單
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}