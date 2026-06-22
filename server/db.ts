import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Database paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "User" | "Vendor" | "Admin";
  profilePic: string;
  isFraud: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  from: string;
  to: string;
  transportType: "Bus" | "Train" | "Launch" | "Plane";
  price: number;
  quantity: number;
  departureTime: string; // ISO date string
  perks: string[];
  image: string;
  vendorName: string;
  vendorEmail: string;
  status: "Pending" | "Approved" | "Rejected";
  advertised: boolean;
}

export interface Booking {
  id: string;
  ticketId: string;
  ticketTitle: string;
  image: string;
  userId: string;
  userName: string;
  userEmail: string;
  vendorEmail: string;
  quantity: number;
  totalPrice: number;
  route: string; // "From -> To"
  departureTime: string;
  status: "Pending" | "Accepted" | "Rejected" | "Paid";
  transactionId?: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  ticketTitle: string;
  paymentDate: string; // ISO date string
  userEmail: string;
  vendorEmail: string;
}

interface DatabaseSchema {
  users: User[];
  tickets: Ticket[];
  bookings: Booking[];
  transactions: Transaction[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [],
  tickets: [],
  bookings: [],
  transactions: []
};

// Global DB in-memory cache
let dbCache: DatabaseSchema = { ...DEFAULT_DB };

// Load database from file
export function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      dbCache = JSON.parse(data);
    } else {
      dbCache = { ...DEFAULT_DB };
      saveDB();
    }
  } catch (err) {
    console.error("Error loading JSON database, using in-memory fallback:", err);
  }
  return dbCache;
}

// Save database to file
export function saveDB(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing JSON database to file:", err);
  }
}

// Seed Initial Data if empty
export async function seedInitialData() {
  loadDB();
  
  if (dbCache.users.length === 0) {
    console.log("Seeding initial users and tickets...");
    
    // Seed Users (Admin, Vendor, User)
    // Passwords are encrypted with bcrypt
    const b1 = await bcrypt.hash("12345678", 10);
    const b2 = await bcrypt.hash("12345678", 10);
    const b3 = await bcrypt.hash("user123", 10);
    
    const adminUser: User = {
      id: "usr_admin",
      name: "Super Admin",
      email: "admin@ticketbari.com",
      passwordHash: b1,
      role: "Admin",
      profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      isFraud: false
    };

    const vendorUser: User = {
      id: "usr_vendor",
      name: "Shohagh Paribahan",
      email: "shohagh@ticketbari.com",
      passwordHash: b2,
      role: "Vendor",
      profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      isFraud: false
    };

    const regularUser: User = {
      id: "usr_user",
      name: "Mohammad Sumon",
      email: "infosumon15@gmail.com",
      passwordHash: b3,
      role: "User",
      profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      isFraud: false
    };

    dbCache.users.push(adminUser, vendorUser, regularUser);

    // Seed Tickets
    const sampleTickets: Ticket[] = [
      {
        id: "tkt_1",
        title: "Green Line Sleeper Scania",
        from: "Dhaka",
        to: "Cox's Bazar",
        transportType: "Bus",
        price: 1800,
        quantity: 36,
        departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
        perks: ["AC Sleeper", "Free Wifi", "Charging Port", "Mineral Water", "Blanket"],
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: true
      },
      {
        id: "tkt_2",
        title: "Suborno Express (701)",
        from: "Dhaka",
        to: "Chittagong",
        transportType: "Train",
        price: 780,
        quantity: 120,
        departureTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day in future
        perks: ["Cozy Snaga Seat", "AC Car", "Food Meal Included", "Power Plug"],
        image: "https://images.unsplash.com/photo-1519642918688-7e43b190123f?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: true
      },
      {
        id: "tkt_3",
        title: "Green Line Water Cruise",
        from: "Dhaka",
        to: "Barisal",
        transportType: "Launch",
        price: 1200,
        quantity: 60,
        departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future
        perks: ["Deluxe Double Cabin", "Premium TV Screen", "Buffet Snack", "River Breeze Balcony"],
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: true
      },
      {
        id: "tkt_4",
        title: "US-Bangla Boeing 737",
        from: "Dhaka",
        to: "Sylhet",
        transportType: "Plane",
        price: 4500,
        quantity: 28,
        departureTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days in future
        perks: ["20kg Check-in Bag", "Hot Continental Meal", "Premium Leather Seats", "Priority Boarding"],
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: true
      },
      {
        id: "tkt_5",
        title: "Silk City Express (762)",
        from: "Rajshahi",
        to: "Dhaka",
        transportType: "Train",
        price: 650,
        quantity: 80,
        departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
        perks: ["AC Snigdha", "Power Outlet", "Luggage Space", "Tea & Coffee Service"],
        image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: true
      },
      {
        id: "tkt_6",
        title: "Saint Martin Luxury Cruise",
        from: "Cox's Bazar",
        to: "Saint Martin",
        transportType: "Launch",
        price: 1800,
        quantity: 90,
        departureTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        perks: ["Ocean Deck Bed", "Live Folk Music", "Buffet Fresh Sea Food", "Open Sun Lounge"],
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: true
      },
      {
        id: "tkt_7",
        title: "Novoair ATR-72",
        from: "Dhaka",
        to: "Saidpur",
        transportType: "Plane",
        price: 4900,
        quantity: 32,
        departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        perks: ["15kg Checked Baggage", "Fruit Juice & Muffin", "Warm Towel service", "Window seating guaranteed"],
        image: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Approved",
        advertised: false
      },
      {
        id: "tkt_8",
        title: "Hanif Hino 1J Non-AC",
        from: "Dhaka",
        to: "Rajshahi",
        transportType: "Bus",
        price: 900,
        quantity: 40,
        departureTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        perks: ["Eco Friendly Non-AC", "Mineral Water bottle", "Adjustable Headrest", "Soft Suspension"],
        image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600",
        vendorName: "Shohagh Paribahan",
        vendorEmail: "shohagh@ticketbari.com",
        status: "Pending",
        advertised: false
      },
      {
        id: "tkt_9",
        title: "Ena Transport Hyundai Universe",
        from: "Sylhet",
        to: "Dhaka",
        transportType: "Bus",
        price: 1500,
        quantity: 45,
        departureTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now (excellent for countdown testing!)
        perks: ["Premium AC", "Plush Leather Seats", "Charging outlet", "Safety Guide Card"],
        image: "https://images.unsplash.com/photo-1563841930606-67e2b64dadbe?auto=format&fit=crop&q=80&w=600",
        vendorName: "Ena Transport",
        vendorEmail: "ena@ticketbari.com",
        status: "Approved",
        advertised: false
      }
    ];

    dbCache.tickets.push(...sampleTickets);

    // Let's create an Ena Transport Vendor as well for rich selection
    const enaVendor: User = {
      id: "usr_vendor_ena",
      name: "Ena Transport",
      email: "ena@ticketbari.com",
      passwordHash: await bcrypt.hash("12345678", 10),
      role: "Vendor",
      profilePic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200",
      isFraud: false
    };
    dbCache.users.push(enaVendor);
    
    saveDB();
  } else {
    // Always upgrade existing admin and shohagh vendor passwords to "12345678" if they are not already updated
    const targetPasswordHash = await bcrypt.hash("12345678", 10);
    let updated = false;
    for (const u of dbCache.users) {
      if (u.email === "admin@ticketbari.com" || u.email === "shohagh@ticketbari.com") {
        const isCorrectPassword = await bcrypt.compare("12345678", u.passwordHash);
        if (!isCorrectPassword) {
          u.passwordHash = targetPasswordHash;
          updated = true;
        }
      }
    }
    if (updated) {
      console.log("Upgraded predefined user passwords to '12345678' in db.json");
      saveDB();
    }
  }
}
