export interface UserSession {
  id?: string;
  name: string;
  role: string;
  roleKey: 'admin' | 'manager' | 'cashier';
  isAdmin: boolean;
  phone: string;
  avatarBg: string;
  loginTime?: string;
  device?: string;
  ip?: string;
  status?: 'active' | 'ended';
  email?: string;
  lastActive?: string;
  permissions?: string[];
}

export interface LoginAuditRecord {
  id: string;
  userName: string;
  userPhone: string;
  role: string;
  roleKey: 'admin' | 'manager' | 'cashier';
  isAdmin: boolean;
  avatarBg: string;
  loginTime: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'active' | 'ended';
  sessionDuration: string;
  actionsPerformed: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  roleKey: 'admin' | 'manager' | 'cashier';
  phone: string;
  email: string;
  avatarBg: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  permissions: {
    dashboard: boolean;
    customers: boolean;
    sales: boolean;
    collections: boolean;
    dealers: boolean;
    stock: boolean;
    expenses: boolean;
    adminPanel: boolean;
  };
}

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Md. Rahim Mia',
    role: 'স্বত্বাধিকারী (অ্যাডমিন) / Owner',
    roleKey: 'admin',
    phone: '01812-345678',
    email: 'rahim.bismillah@gmail.com',
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
    status: 'active',
    joinedDate: '2020-01-15',
    permissions: {
      dashboard: true,
      customers: true,
      sales: true,
      collections: true,
      dealers: true,
      stock: true,
      expenses: true,
      adminPanel: true,
    },
  },
  {
    id: 'staff-2',
    name: 'Shakil Ahmed',
    role: 'সেলস ম্যানেজার / Sales Manager',
    roleKey: 'manager',
    phone: '01712-987654',
    email: 'shakil.sales@gmail.com',
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    status: 'active',
    joinedDate: '2022-04-10',
    permissions: {
      dashboard: true,
      customers: true,
      sales: true,
      collections: true,
      dealers: false,
      stock: true,
      expenses: false,
      adminPanel: false,
    },
  },
  {
    id: 'staff-3',
    name: 'Tahmid Hasan',
    role: 'ক্যাশিয়ার ও হিসাবরক্ষক / Cashier',
    roleKey: 'cashier',
    phone: '01911-223344',
    email: 'tahmid.cash@gmail.com',
    avatarBg: 'bg-gradient-to-tr from-amber-600 to-orange-600',
    status: 'active',
    joinedDate: '2023-08-01',
    permissions: {
      dashboard: true,
      customers: true,
      sales: true,
      collections: true,
      dealers: true,
      stock: false,
      expenses: true,
      adminPanel: false,
    },
  },
];

export const INITIAL_LOGIN_LOGS: LoginAuditRecord[] = [
  {
    id: 'log-101',
    userName: 'Md. Rahim Mia',
    userPhone: '01812-345678',
    role: 'স্বত্বাধিকারী (অ্যাডমিন)',
    roleKey: 'admin',
    isAdmin: true,
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
    loginTime: '2026-10-25 08:30 AM',
    ipAddress: '192.168.1.10 (Dhaka Store HQ)',
    deviceInfo: 'Desktop Chrome 124 • Linux/Windows',
    status: 'active',
    sessionDuration: 'অনলাইন (সক্রিয়)',
    actionsPerformed: 'ড্যাশবোর্ড পর্যবেক্ষণ, কিস্তি কালেকশন অনুমোদন, ডিলার বিল চেক',
  },
  {
    id: 'log-102',
    userName: 'Shakil Ahmed',
    userPhone: '01712-987654',
    role: 'সেলস ম্যানেজার',
    roleKey: 'manager',
    isAdmin: false,
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    loginTime: '2026-10-25 09:15 AM',
    ipAddress: '192.168.1.15 (Counter Terminal #1)',
    deviceInfo: 'Shop POS Tablet • Chrome Mobile',
    status: 'ended',
    sessionDuration: '২ ঘণ্টা ৪৫ মিনিট',
    actionsPerformed: '২টি নতুন কিস্তি সেল এন্ট্রি (এলইডি টিভি ৩২", ফ্রিজ ২২০ লিটার)',
  },
  {
    id: 'log-103',
    userName: 'Tahmid Hasan',
    userPhone: '01911-223344',
    role: 'ক্যাশিয়ার ও হিসাবরক্ষক',
    roleKey: 'cashier',
    isAdmin: false,
    avatarBg: 'bg-gradient-to-tr from-amber-600 to-orange-600',
    loginTime: '2026-10-24 04:30 PM',
    ipAddress: '192.168.1.20 (Accounts Desk)',
    deviceInfo: 'Desktop Firefox 125 • Store Terminal',
    status: 'ended',
    sessionDuration: '৩ ঘণ্টা ১০ মিনিট',
    actionsPerformed: 'নগদ ক্যাশ গণনা, ৳১৫,০০০ কিস্তি কালেকশন ভাউচার তৈরি',
  },
  {
    id: 'log-104',
    userName: 'Md. Rahim Mia',
    userPhone: '01812-345678',
    role: 'স্বত্বাধিকারী (অ্যাডমিন)',
    roleKey: 'admin',
    isAdmin: true,
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
    loginTime: '2026-10-24 10:00 AM',
    ipAddress: '103.145.22.4 (Mobile Network)',
    deviceInfo: 'Samsung Android Chrome • Mobile',
    status: 'ended',
    sessionDuration: '১ ঘণ্টা ১৫ মিনিট',
    actionsPerformed: 'মাসিক প্রফিট ও ডিলার দেনা সারসংক্ষেপ পর্যবেক্ষণ',
  },
  {
    id: 'log-105',
    userName: 'Shakil Ahmed',
    userPhone: '01712-987654',
    role: 'সেলস ম্যানেজার',
    roleKey: 'manager',
    isAdmin: false,
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    loginTime: '2026-10-23 09:30 AM',
    ipAddress: '192.168.1.15 (Counter Terminal #1)',
    deviceInfo: 'Shop POS Tablet • Chrome Mobile',
    status: 'ended',
    sessionDuration: '৪ ঘণ্টা ২০ মিনিট',
    actionsPerformed: '৩ জন গ্রাহকের কিস্তি রসিদ প্রিন্ট, স্টক আপডেট',
  },
];
