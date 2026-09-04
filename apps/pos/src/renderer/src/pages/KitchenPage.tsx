import React, { useState, useEffect } from 'react';
import { Clock, Volume2, VolumeX, Wifi, ArrowLeft, Play, Check, Undo2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type OrderStatus = 'pending' | 'in_progress' | 'ready';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  modifiers: string[];
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  table: string;
  server: string;
  status: OrderStatus;
  timestamp: Date;
  items: OrderItem[];
}

export default function KitchenPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeStation, setActiveStation] = useState('Semua');

  // Dummy data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: '#1024',
      table: 'Meja 4',
      server: 'Budi',
      status: 'pending',
      timestamp: new Date(Date.now() - 300000), // 5 mins ago
      items: [
        { id: 'i1', name: 'Iced Latte', qty: 2, modifiers: ['Less Sugar', 'Oat Milk'], notes: 'Jangan terlalu dingin' },
        { id: 'i2', name: 'Croissant', qty: 1, modifiers: [] }
      ]
    },
    {
      id: '2',
      orderNumber: '#1025',
      table: 'Takeaway',
      server: 'Siti',
      status: 'in_progress',
      timestamp: new Date(Date.now() - 720000), // 12 mins ago
      items: [
        { id: 'i3', name: 'Nasi Goreng Spesial', qty: 1, modifiers: ['Pedas', 'Telur Dadar'] }
      ]
    },
    {
      id: '3',
      orderNumber: '#1022',
      table: 'Meja 12',
      server: 'Budi',
      status: 'ready',
      timestamp: new Date(Date.now() - 1200000), // 20 mins ago
      items: [
        { id: 'i4', name: 'Matcha Frappe', qty: 1, modifiers: ['Extra Whipped Cream'] }
      ]
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playChime = () => {
    if (audioEnabled) {
      // Placeholder for sound effect
      console.log('Ding!');
    }
  };

  const updateOrderStatus = (id: string, newStatus: OrderStatus | 'done') => {
    if (newStatus === 'done') {
      setOrders(orders.filter(o => o.id !== id));
      return;
    }
    
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    playChime();
  };

  const formatElapsedTime = (timestamp: Date) => {
    const diff = Math.floor((new Date().getTime() - timestamp.getTime()) / 60000);
    return `${diff}m`;
  };

  const getTimerColor = (timestamp: Date) => {
    const diff = Math.floor((new Date().getTime() - timestamp.getTime()) / 60000);
    if (diff > 10) return 'bg-red-500/20 text-red-400';
    if (diff > 5) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-slate-700 text-slate-300';
  };

  const renderTicket = (order: Order) => (
    <div key={order.id} className={`bg-slate-800 rounded-lg p-4 border-l-4 mb-4 ${
      order.status === 'pending' ? 'border-red-500' :
      order.status === 'in_progress' ? 'border-amber-500' : 'border-green-500'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{order.orderNumber}</h3>
          <p className="text-slate-400 text-sm">{order.table} • {order.server}</p>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-1 ${getTimerColor(order.timestamp)}`}>
          <Clock size={14} />
          {formatElapsedTime(order.timestamp)}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-slate-200 border-b border-slate-700 pb-2 last:border-0">
            <div className="flex gap-2">
              <span className="font-bold text-white">{item.qty}x</span>
              <span className="font-semibold text-lg">{item.name}</span>
            </div>
            {item.modifiers.length > 0 && (
              <p className="text-sm text-slate-400 ml-6">- {item.modifiers.join(', ')}</p>
            )}
            {item.notes && (
              <p className="text-sm text-amber-400/80 ml-6 italic">Catatan: {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-auto">
        {order.status === 'pending' && (
          <button 
            onClick={() => updateOrderStatus(order.id, 'in_progress')}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <Play size={18} /> Mulai Racik
          </button>
        )}
        {order.status === 'in_progress' && (
          <>
            <button 
              onClick={() => updateOrderStatus(order.id, 'pending')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 rounded-lg font-bold flex items-center justify-center"
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Check size={18} /> Selesai
            </button>
          </>
        )}
        {order.status === 'ready' && (
          <>
             <button 
              onClick={() => updateOrderStatus(order.id, 'in_progress')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 rounded-lg font-bold flex items-center justify-center"
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={() => updateOrderStatus(order.id, 'done')}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Done / Picked Up
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            {['☕ Barista Bar', '🍳 Dapur Panas', '🥐 Bakery/Pastry', 'Semua'].map(station => (
              <button
                key={station}
                onClick={() => setActiveStation(station)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeStation === station ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full text-sm">
            <Wifi size={16} /> LAN Sync
          </div>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg ${audioEnabled ? 'text-amber-400 hover:bg-amber-400/10' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <div className="text-2xl font-bold font-mono tracking-wider text-white">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 p-6 grid grid-cols-3 gap-6 overflow-hidden">
        {/* PENDING */}
        <div className="flex flex-col bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
          <div className="bg-slate-950/80 p-4 border-b border-red-500/30 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-lg font-bold text-white tracking-wide">PENDING</h2>
            <span className="ml-auto bg-slate-800 px-2 py-1 rounded text-sm">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {orders.filter(o => o.status === 'pending').map(renderTicket)}
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="flex flex-col bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
          <div className="bg-slate-950/80 p-4 border-b border-amber-500/30 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <h2 className="text-lg font-bold text-white tracking-wide">IN PROGRESS</h2>
            <span className="ml-auto bg-slate-800 px-2 py-1 rounded text-sm">{orders.filter(o => o.status === 'in_progress').length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {orders.filter(o => o.status === 'in_progress').map(renderTicket)}
          </div>
        </div>

        {/* READY */}
        <div className="flex flex-col bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
          <div className="bg-slate-950/80 p-4 border-b border-green-500/30 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-bold text-white tracking-wide">READY</h2>
            <span className="ml-auto bg-slate-800 px-2 py-1 rounded text-sm">{orders.filter(o => o.status === 'ready').length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {orders.filter(o => o.status === 'ready').map(renderTicket)}
          </div>
        </div>
      </main>
    </div>
  );
}
