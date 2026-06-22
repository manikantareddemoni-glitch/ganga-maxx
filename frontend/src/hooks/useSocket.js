import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { transports: ['websocket'] });
    const add = (event) => setEvents((items) => [{ id: Date.now(), ...event }, ...items].slice(0, 8));
    socket.on('notification:new', add);
    socket.on('payment:created', () => add({ type: 'payment', title: 'Payment received', message: 'Dashboard balances updated.' }));
    socket.on('customer:created', (customer) => add({ type: 'customer', title: 'New customer added', message: customer.company_name }));
    socket.on('invoice:updated', () => add({ type: 'invoice', title: 'Invoice updated', message: 'Outstanding and aging changed.' }));
    return () => socket.disconnect();
  }, []);

  return events;
}
