import { createContext, useContext, useEffect, useState } from 'react';
import { donors, receivers, donations, transactions } from '../data/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'donor' | 'receiver' | 'admin'
  const [donationList, setDonationList] = useState(donations);
  const [transactionList, setTransactionList] = useState(transactions);
  const [notifications, setNotifications] = useState([
    { id: 'n1', message: 'New donation available near you!', read: false, time: '2 min ago' },
    { id: 'n2', message: 'Your donation was successfully picked up.', read: false, time: '1 hr ago' },
    { id: 'n3', message: 'Review request from Hope Shelter.', read: true, time: '3 hr ago' },
  ]);

  useEffect(() => {
    const storedRole = localStorage.getItem('ts_role');
    const storedUser = localStorage.getItem('ts_user');
    if (storedRole && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setRole(storedRole);
      } catch (error) {
        console.warn('Failed to parse stored user', error);
      }
    }
  }, []);

  const login = (userOrId, userRole) => {
    const user =
      typeof userOrId === 'object'
        ? userOrId
        : userRole === 'donor'
        ? donors.find((d) => d.id === userOrId)
        : userRole === 'receiver'
        ? receivers.find((r) => r.id === userOrId)
        : { id: 'admin', name: 'Admin', type: 'Administrator' };

    if (typeof userOrId === 'object') {
      setCurrentUser(user);
    } else {
      setCurrentUser(user || { id: userOrId, name: userOrId, type: userRole });
    }
    setRole(userRole);
  };

  const logout = () => {
    setCurrentUser(null);
    setRole(null);
  };

  const addDonation = (donation) => {
    const enrichedDonation = {
      ...donation,
      id: `don${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDonationList((prev) => [enrichedDonation, ...prev]);
  };

  const updateDonationStatus = (id, status) => {
    setDonationList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const value = {
    currentUser,
    role,
    donations: donationList,
    transactions: transactionList,
    donors,
    receivers,
    notifications,
    login,
    logout,
    addDonation,
    updateDonationStatus,
    markNotificationRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;
