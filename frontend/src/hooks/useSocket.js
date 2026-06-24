import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl || socketUrl.includes('127.0.0.1') || socketUrl.includes('localhost')) {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        socketUrl = 'https://ganga-maxx-backend.onrender.com';
      } else {
        socketUrl = socketUrl || 'http://127.0.0.1:5000';
      }
    }
    const socket = io(socketUrl, { transports: ['websocket'] });
    const add = (event) => setEvents((items) => [{ id: Date.now(), ...event }, ...items].slice(0, 8));
    socket.on('notification:new', add);
    socket.on('payment:created', () => add({ type: 'payment', title: 'Payment received', message: 'Dashboard balances updated.' }));
    socket.on('customer:created', (customer) => add({ type: 'customer', title: 'New customer added', message: customer.company_name }));
    socket.on('invoice:updated', () => add({ type: 'invoice', title: 'Invoice updated', message: 'Outstanding and aging changed.' }));
    return () => socket.disconnect();
  }, []);

  return events;
}
