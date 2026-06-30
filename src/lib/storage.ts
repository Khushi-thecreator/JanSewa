export interface Complaint {
  id: string;
  category: string;
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  landmark: string;
  photoPreview?: string;
  citizenName?: string;
  phone?: string;
  email?: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  assignedOfficer?: string;
  officerRole?: string;
  date: string;
  time: string;
  ward: string;
  upvotes: number;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  feedbackRating?: number;
  feedbackComment?: string;
}

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'JS-IND-2026-048',
    category: 'Sanitation',
    title: 'Overflowing community dustbin in Bandra West',
    description: 'The green community waste dump is overflowing and garbage has spilled onto the street corner, causing strong odor and hygiene risks.',
    latitude: '19.059600',
    longitude: '72.829500',
    landmark: 'Near Carter Road, Bandra West, Mumbai',
    status: 'In Progress',
    assignedOfficer: 'Amit Sharma',
    officerRole: 'Junior Inspector, Sanitation Wing',
    date: '2026-06-28',
    time: '2 hours ago',
    ward: 'Ward 104 (Bandra West, Mumbai)',
    upvotes: 24,
    photoPreview: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=300&fit=crop',
    priority: 'High'
  },
  {
    id: 'JS-IND-2026-042',
    category: 'Roads',
    title: 'Dangerous pothole near Connaught Place',
    description: 'There is a deep pothole right on the inner circle road curve. It poses a massive skid danger for two-wheelers during rainy hours.',
    latitude: '28.628900',
    longitude: '77.215000',
    landmark: 'Block E Inner Circle, Connaught Place, New Delhi',
    status: 'Pending',
    assignedOfficer: 'Vikram Singh',
    officerRole: 'Sub-Divisional Engineer, Road Maintenance',
    date: '2026-06-29',
    time: '5 hours ago',
    ward: 'Ward 08 (Connaught Place, New Delhi)',
    upvotes: 48,
    photoPreview: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&h=300&fit=crop',
    priority: 'Emergency'
  },
  {
    id: 'JS-IND-2026-031',
    category: 'Streetlights',
    title: 'Multiple streetlights offline in Indiranagar',
    description: 'An entire row of street lamps is dark on the 100 Feet Road corner for three consecutive nights, causing security and crossing safety issues.',
    latitude: '12.971900',
    longitude: '77.594600',
    landmark: 'Opposite Metro Station, Indiranagar, Bengaluru',
    status: 'Resolved',
    assignedOfficer: 'Karthik Rao',
    officerRole: 'Assistant Electrical Engineer',
    date: '2026-06-27',
    time: '1 day ago',
    ward: 'Ward 54 (Indiranagar, Bengaluru)',
    upvotes: 12,
    photoPreview: 'https://images.unsplash.com/photo-1520624021200-8433393952ba?w=500&h=300&fit=crop',
    priority: 'Low'
  },
  {
    id: 'JS-IND-2026-050',
    category: 'Drainage and Sewerage',
    title: 'Clogged storm drain causing localized flooding',
    description: 'Debris from recent path construction has choked the rainwater discharge outlet, causing knee-deep pooling on the pedestrian lane.',
    latitude: '13.082700',
    longitude: '80.270700',
    landmark: 'Beside Nungambakkam High Road, Chennai',
    status: 'Pending',
    date: '2026-06-29',
    time: '3 hours ago',
    ward: 'Ward 112 (Nungambakkam, Chennai)',
    upvotes: 8,
    photoPreview: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&h=300&fit=crop',
    priority: 'Medium'
  }
];

export function getComplaints(): Complaint[] {
  const stored = localStorage.getItem('jansewa_complaints');
  if (!stored) {
    localStorage.setItem('jansewa_complaints', JSON.stringify(DEFAULT_COMPLAINTS));
    return DEFAULT_COMPLAINTS;
  }
  try {
    const list = JSON.parse(stored);
    return list.map((c: any) => ({
      ...c,
      priority: c.priority || 'Medium'
    }));
  } catch (e) {
    return DEFAULT_COMPLAINTS;
  }
}

export function saveComplaints(complaints: Complaint[]) {
  localStorage.setItem('jansewa_complaints', JSON.stringify(complaints));
}

export function addComplaint(complaint: Omit<Complaint, 'id' | 'status' | 'date' | 'time' | 'upvotes'>): Complaint {
  const complaints = getComplaints();
  const randomNum = Math.floor(100 + Math.random() * 900);
  const newId = `JS-IND-2026-${randomNum}`;
  
  const currentUser = getCurrentUser();
  const fullComplaint: Complaint = {
    ...complaint,
    id: newId,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    time: 'Just now',
    upvotes: 0,
    citizenName: complaint.citizenName || currentUser?.name || 'Anonymous Citizen',
    email: complaint.email || currentUser?.email || 'N/A'
  };
  
  complaints.unshift(fullComplaint);
  saveComplaints(complaints);
  return fullComplaint;
}

export function getVotedComplaints(): string[] {
  const stored = localStorage.getItem('jansewa_voted_ids');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function hasVoted(id: string): boolean {
  const voted = getVotedComplaints();
  return voted.includes(id);
}

export function addVote(id: string) {
  const voted = getVotedComplaints();
  if (!voted.includes(id)) {
    voted.push(id);
    localStorage.setItem('jansewa_voted_ids', JSON.stringify(voted));
  }
}

export function upvoteComplaint(id: string): Complaint[] {
  const complaints = getComplaints();
  const updated = complaints.map(c => {
    if (c.id === id) {
      return { ...c, upvotes: c.upvotes + 1 };
    }
    return c;
  });
  saveComplaints(updated);
  addVote(id);
  return updated;
}

export function updateComplaintStatus(id: string, status: 'Pending' | 'In Progress' | 'Resolved', assignedOfficer?: string, officerRole?: string): Complaint[] {
  const complaints = getComplaints();
  const updated = complaints.map(c => {
    if (c.id === id) {
      return { 
        ...c, 
        status, 
        assignedOfficer: assignedOfficer || c.assignedOfficer, 
        officerRole: officerRole || c.officerRole 
      };
    }
    return c;
  });
  saveComplaints(updated);
  return updated;
}

export function downloadReceiptFile(complaint: {
  id: string;
  category: string;
  title: string;
  description: string;
  landmark: string;
  latitude: string;
  longitude: string;
  citizenName?: string;
  phone?: string;
  email?: string;
  status: string;
  date: string;
  ward?: string;
}) {
  const receiptContent = `========================================================
             JANSEWA CIVIC GRIEVANCE PORTAL
         NATIONAL MUNICIPAL GRIEVANCE CELL (MoHUA)
========================================================
RECEIPT REFERENCE ID: ${complaint.id}
DATE RECORDED:        ${complaint.date}
GRIEVANCE STATUS:     ${complaint.status.toUpperCase()}
--------------------------------------------------------
CITIZEN DETAILS:
Name:                 ${complaint.citizenName || 'Anonymous Citizen'}
Email Address:        ${complaint.email || 'Not registered'}
--------------------------------------------------------
COMPLAINT SUMMARY:
Category:             ${complaint.category}
Subject:              ${complaint.title}
Key Landmark:         ${complaint.landmark}
GPS Coordinates:      Latitude ${complaint.latitude}, Longitude ${complaint.longitude}
Assigned Ward:        ${complaint.ward || 'Ward 08 (Connaught Place, New Delhi)'}

Detailed Description:
"${complaint.description}"
--------------------------------------------------------
OFFICIAL DISPATCH STATUS:
- Routed instantly via JanSewa Automated National GIS Router.
- Assigned to Local Ward Engineer & Sanitation Inspector.
- Status notification Email queue initiated.
--------------------------------------------------------
Verification Signature:
Approved by: National Civic Grievance Redressal Cell (e-Stamp)
Digital Stamp ID: JANS-IND-${complaint.id.split('-').pop()}-2026

Disclaimer: This is an official digital receipt. Standard
resolution times range from 24-72 working hours. Progress alerts
will be triggered via Email to ${complaint.email || 'registered email address'}.
========================================================`;

  const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `JanSewa_Receipt_${complaint.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function submitComplaintFeedback(id: string, rating: number, comment: string): Complaint[] {
  const complaints = getComplaints();
  const updated = complaints.map(c => {
    if (c.id === id) {
      return { 
        ...c, 
        feedbackRating: rating, 
        feedbackComment: comment 
      };
    }
    return c;
  });
  saveComplaints(updated);
  return updated;
}

export interface User {
  name: string;
  email: string;
  ward: string;
  password?: string;
}

const DEFAULT_USERS: User[] = [
  {
    name: "Khushi Sharma",
    email: "khushi@example.com",
    ward: "Ward 08 (Connaught Place, New Delhi)",
    password: "password123"
  }
];

export function getUsers(): User[] {
  const stored = localStorage.getItem('jansewa_users');
  if (!stored) {
    localStorage.setItem('jansewa_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem('jansewa_users', JSON.stringify(users));
}

export function signupUser(name: string, email: string, ward: string, password?: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const emailLower = email.toLowerCase();
  
  if (users.some(u => u.email.toLowerCase() === emailLower)) {
    return { success: false, error: 'An account with this email already exists' };
  }
  
  const newUser: User = { name, email, ward, password };
  users.push(newUser);
  saveUsers(users);
  
  // Auto login
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function signinUser(email: string, password?: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const emailLower = email.toLowerCase();
  
  const user = users.find(u => u.email.toLowerCase() === emailLower);
  if (!user) {
    return { success: false, error: 'No account found with this email' };
  }
  
  if (password && user.password && user.password !== password) {
    return { success: false, error: 'Incorrect password' };
  }
  
  setCurrentUser(user);
  return { success: true, user };
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('jansewa_current_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('jansewa_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('jansewa_current_user');
  }
}

export function logoutUser() {
  setCurrentUser(null);
}

// Distance calculation functions for GPS coordinates
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getNearbyComplaints(userLat: number, userLon: number, limit = 5): (Complaint & { distanceKm: number })[] {
  const complaints = getComplaints();
  const calculated = complaints.map(c => {
    const lat = parseFloat(c.latitude);
    const lon = parseFloat(c.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      return { ...c, distanceKm: 999999 };
    }
    const dist = getDistanceInKm(userLat, userLon, lat, lon);
    return { ...c, distanceKm: dist };
  });
  
  // Sort by distance ascending
  calculated.sort((a, b) => a.distanceKm - b.distanceKm);
  
  // Return top limit
  return calculated.slice(0, limit);
}

export interface Admin {
  name: string;
  email: string;
  badgeId: string;
  zone: string;
  password?: string;
  phone?: string;
}

const DEFAULT_ADMINS: Admin[] = [
  {
    name: "Shri Rajesh Verma",
    email: "admin@jansewa.gov.in",
    badgeId: "OFFICER-2026-001",
    zone: "Central Zone",
    password: "password123",
    phone: "+91 98765 43210"
  }
];

export function getAdmins(): Admin[] {
  const stored = localStorage.getItem('jansewa_admins');
  if (!stored) {
    localStorage.setItem('jansewa_admins', JSON.stringify(DEFAULT_ADMINS));
    return DEFAULT_ADMINS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_ADMINS;
  }
}

export function saveAdmins(admins: Admin[]) {
  localStorage.setItem('jansewa_admins', JSON.stringify(admins));
}

export function signupAdmin(name: string, email: string, badgeId: string, zone: string, password?: string, phone?: string): { success: boolean; error?: string; admin?: Admin } {
  const admins = getAdmins();
  const emailLower = email.toLowerCase();
  
  if (admins.some(a => a.email.toLowerCase() === emailLower)) {
    return { success: false, error: 'An admin officer with this email already exists' };
  }
  
  if (admins.some(a => a.badgeId.toUpperCase() === badgeId.toUpperCase())) {
    return { success: false, error: 'An admin officer with this Employee Badge ID already exists' };
  }
  
  const newAdmin: Admin = { name, email, badgeId, zone, password, phone };
  admins.push(newAdmin);
  saveAdmins(admins);
  
  // Auto login
  setCurrentAdmin(newAdmin);
  return { success: true, admin: newAdmin };
}

export function signinAdmin(email: string, password?: string): { success: boolean; error?: string; admin?: Admin } {
  const admins = getAdmins();
  const emailLower = email.toLowerCase();
  
  const admin = admins.find(a => a.email.toLowerCase() === emailLower);
  if (!admin) {
    return { success: false, error: 'No admin officer account found with this email' };
  }
  
  if (password && admin.password && admin.password !== password) {
    return { success: false, error: 'Incorrect credentials' };
  }
  
  setCurrentAdmin(admin);
  return { success: true, admin };
}

export function getCurrentAdmin(): Admin | null {
  const stored = localStorage.getItem('jansewa_current_admin');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function setCurrentAdmin(admin: Admin | null) {
  if (admin) {
    localStorage.setItem('jansewa_current_admin', JSON.stringify(admin));
  } else {
    localStorage.removeItem('jansewa_current_admin');
  }
}

export function logoutAdmin() {
  setCurrentAdmin(null);
}



