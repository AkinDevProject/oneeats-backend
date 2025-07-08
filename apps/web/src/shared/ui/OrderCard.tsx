import React from "react";

interface OrderCardProps {
  id: string;
  time: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  status: "new" | "preparing" | "ready";
  onAccept?: () => void;
  onDecline?: () => void;
  onMarkReady?: () => void;
  onMarkCompleted?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  id,
  time,
  items,
  total,
  status,
  onAccept,
  onDecline,
  onMarkReady,
  onMarkCompleted,
}) => (
  <div className="bg-white rounded-xl shadow p-4 mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="font-bold">#{id}</span>
      <span className="text-sm text-gray-400">{time}</span>
    </div>
    <div className="mb-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span>{item.qty}x {item.name}</span>
          <span>${(item.price * item.qty).toFixed(2)}</span>
        </div>
      ))}
    </div>
    <div className="flex justify-between items-center border-t pt-2 mt-2">
      <span className="font-semibold">Total: <span className="font-bold">${total.toFixed(2)}</span></span>
    </div>
    {/* Actions */}
    <div className="mt-4 flex gap-2">
      {status === "new" && (
        <>
          <button onClick={onAccept} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition-all duration-150 shadow active:scale-95">Accept</button>
          <button onClick={onDecline} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition-all duration-150 shadow active:scale-95">Decline</button>
        </>
      )}
      {status === "preparing" && (
        <button onClick={onMarkReady} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition-all duration-150 shadow active:scale-95">Mark as Ready</button>
      )}
      {status === "ready" && (
        <button disabled className="bg-gray-200 text-gray-500 px-4 py-1 rounded cursor-not-allowed">Mark as Completed</button>
      )}
    </div>
  </div>
);

