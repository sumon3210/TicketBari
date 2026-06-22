import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  loadDB, 
  saveDB, 
  seedInitialData, 
  User, 
  Ticket, 
  Booking, 
  Transaction 
} from "./server/db";

// Ensure UTC timezone default handles matches correctly
process.env.TZ = "UTC";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "ticketbari_premium_jwt_secret_key_2025_2026";

// Middlewares
app.use(express.json());

// Load and seed initial database data
seedInitialData();

// JWT Verification Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "User" | "Vendor" | "Admin";
    name: string;
    isFraud: boolean;
  };
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided, authorization denied" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is invalid or expired" });
    return;
  }
};

// --- AUTHENTICATION ROUTES ---

// Register
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    const { users } = loadDB();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === "Vendor" ? "Vendor" : "User", // default to User or Vendor if selected
      profilePic: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      isFraud: false
    };

    users.push(newUser);
    saveDB();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, isFraud: newUser.isFraud },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.profilePic,
        isFraud: newUser.isFraud
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login
app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const { users } = loadDB();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, isFraud: user.isFraud },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isFraud: user.isFraud
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Social Google Login Mock
app.post("/api/auth/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, googleId, imageUrl } = req.body;
    if (!email || !name) {
      res.status(400).json({ message: "Invalid Google payload" });
      return;
    }

    const { users } = loadDB();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Social Register
      const passwordHash = await bcrypt.hash("google_mock_password_unusable_" + Math.random(), 10);
      user = {
        id: "usr_g_" + (googleId || Math.random().toString(36).substr(2, 9)),
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "User",
        profilePic: imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        isFraud: false
      };
      users.push(user);
      saveDB();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, isFraud: user.isFraud },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isFraud: user.isFraud
      }
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Server error during Google signup/login" });
  }
});

// Get User Profile details
app.get("/api/auth/me", verifyToken, (req: AuthenticatedRequest, res: Response) => {
  const { users } = loadDB();
  const found = users.find(u => u.id === req.user?.id);
  if (!found) {
    res.status(404).json({ message: "User profile not found" });
    return;
  }
  res.json({
    user: {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      profilePic: found.profilePic,
      isFraud: found.isFraud
    }
  });
});


// --- TRAVEL TICKETS PUBLIC OPERATIONS ---

// Get Approved Tickets with filtration, searching, sorting and pagination
app.get("/api/tickets", (req: Request, res: Response) => {
  const { tickets, users } = loadDB();
  
  // Find fraudulent vendors to hide their tickets
  const fraudEmails = users.filter(u => u.role === "Vendor" && u.isFraud).map(u => u.email.toLowerCase());

  // Filter approved and not from fraud vendor
  let results = tickets.filter(t => t.status === "Approved" && !fraudEmails.includes(t.vendorEmail.toLowerCase()));

  // Search From -> To
  const searchFrom = req.query.from as string;
  const searchTo = req.query.to as string;
  if (searchFrom && searchFrom.trim() !== "") {
    results = results.filter(t => t.from.toLowerCase().includes(searchFrom.toLowerCase()));
  }
  if (searchTo && searchTo.trim() !== "") {
    results = results.filter(t => t.to.toLowerCase().includes(searchTo.toLowerCase()));
  }

  // Filter Transport Type
  const transportType = req.query.transportType as string;
  if (transportType && transportType !== "All") {
    results = results.filter(t => t.transportType.toLowerCase() === transportType.toLowerCase());
  }

  // Filter Price Sort
  const sort = req.query.sort as string; // "low_high" or "high_low"
  if (sort === "low_high") {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === "high_low") {
    results.sort((a, b) => b.price - a.price);
  }

  // Pagination
  const page = parseInt(req.query.page as string || "1", 10);
  const limit = parseInt(req.query.limit as string || "6", 10);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  res.json({
    tickets: paginatedResults,
    totalCount: results.length,
    totalPages: Math.ceil(results.length / limit) || 1,
    currentPage: page
  });
});

// Advertisements Selection (Admin selected 6 tickets)
app.get("/api/tickets/advertised", (req: Request, res: Response) => {
  const { tickets, users } = loadDB();
  const fraudEmails = users.filter(u => u.role === "Vendor" && u.isFraud).map(u => u.email.toLowerCase());
  
  // Only approved, advertised, and vendor is not fraud. Limit to 6
  const results = tickets
    .filter(t => t.status === "Approved" && t.advertised && !fraudEmails.includes(t.vendorEmail.toLowerCase()))
    .slice(0, 6);
  
  res.json(results);
});

// Latest Tickets (Recent 6-8 tickets)
app.get("/api/tickets/latest", (req: Request, res: Response) => {
  const { tickets, users } = loadDB();
  const fraudEmails = users.filter(u => u.role === "Vendor" && u.isFraud).map(u => u.email.toLowerCase());
  
  // Only approved, not fraud. Sort by some order (e.g. latest, we can mock it here - reverse list or order by departure or id)
  const results = tickets
    .filter(t => t.status === "Approved" && !fraudEmails.includes(t.vendorEmail.toLowerCase()))
    .slice()
    .reverse()
    .slice(0, 8); // 6-8 latest tickets
  
  res.json(results);
});

// Specific Ticket Details (Protected check inside UI, public API is fine or protected)
app.get("/api/tickets/:id", (req: Request, res: Response) => {
  const { tickets } = loadDB();
  const found = tickets.find(t => t.id === req.params.id);
  if (!found) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }
  res.json(found);
});


// --- USER BOOKING OPERATIONS (JWT Protected) ---

// Book a Ticket
app.post("/api/bookings", verifyToken, (req: AuthenticatedRequest, res: Response): void => {
  const { tickets, bookings, users } = loadDB();
  const { ticketId, quantity } = req.body;
  
  if (!ticketId || !quantity || quantity <= 0) {
    res.status(400).json({ message: "Invalid booking details" });
    return;
  }

  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  // Check departure time
  const departureDate = new Date(ticket.departureTime);
  if (departureDate.getTime() < Date.now()) {
    res.status(400).json({ message: "This trip has already departed" });
    return;
  }

  // Check quantity availability
  if (ticket.quantity === 0) {
    res.status(400).json({ message: "This ticket is sold out" });
    return;
  }

  if (quantity > ticket.quantity) {
    res.status(400).json({ message: `Cannot book more than ${ticket.quantity} available tickets` });
    return;
  }

  // Check if current user is fraud
  const dbUser = users.find(u => u.id === req.user?.id);
  if (dbUser?.isFraud) {
    res.status(403).json({ message: "Booking is blocked because your account is suspended." });
    return;
  }

  // Check if ticket's vendor is fraud
  const vendorUser = users.find(u => u.email.toLowerCase() === ticket.vendorEmail.toLowerCase());
  if (vendorUser?.isFraud) {
    res.status(400).json({ message: "This transport's operations are currently suspended by admin." });
    return;
  }

  const totalPrice = ticket.price * quantity;
  const newBooking: Booking = {
    id: "bk_" + Math.random().toString(36).substr(2, 9),
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    image: ticket.image,
    userId: req.user!.id,
    userName: req.user!.name,
    userEmail: req.user!.email,
    vendorEmail: ticket.vendorEmail,
    quantity,
    totalPrice,
    route: `${ticket.from} ➔ ${ticket.to}`,
    departureTime: ticket.departureTime,
    status: "Pending"
  };

  bookings.push(newBooking);
  saveDB();

  res.status(211).json({
    message: "Booking submitted successfully. Pending vendor review.",
    booking: newBooking
  });
});

// View My Booked Tickets list
app.get("/api/bookings/my", verifyToken, (req: AuthenticatedRequest, res: Response) => {
  const { bookings } = loadDB();
  const results = bookings.filter(b => b.userId === req.user?.id);
  res.json(results);
});

// Cancel booking before Vendor accepts/rejects
app.post("/api/bookings/:id/cancel", verifyToken, (req: AuthenticatedRequest, res: Response): void => {
  const { bookings } = loadDB();
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id && b.userId === req.user?.id);

  if (bookingIndex === -1) {
    res.status(404).json({ message: "Booking not found or access denied" });
    return;
  }

  const booking = bookings[bookingIndex];
  if (booking.status !== "Pending") {
    res.status(400).json({ message: `Cannot cancel a booking that is already ${booking.status}` });
    return;
  }

  // Remove booking from DB
  bookings.splice(bookingIndex, 1);
  saveDB();

  res.json({ message: "Booking cancelled successfully" });
});

// Pay Booking with simulates Stripe standard
app.post("/api/bookings/:id/pay", verifyToken, (req: AuthenticatedRequest, res: Response): void => {
  const { bookings, tickets, transactions, users } = loadDB();
  const booking = bookings.find(b => b.id === req.params.id && b.userId === req.user?.id);

  if (!booking) {
    res.status(404).json({ message: "Booking record not found" });
    return;
  }

  if (booking.status !== "Accepted") {
    res.status(400).json({ message: "Trip is not approved for payment by vendor, or already paid" });
    return;
  }

  // Check departure time expired
  const depTime = new Date(booking.departureTime).getTime();
  if (depTime < Date.now()) {
    res.status(400).json({ message: "This departure time has elapsed. Payment period expired" });
    return;
  }

  const ticket = tickets.find(t => t.id === booking.ticketId);
  if (!ticket) {
    res.status(404).json({ message: "Original ticket layout deleted or unavailable" });
    return;
  }

  if (booking.quantity > ticket.quantity) {
    res.status(400).json({ message: `Only ${ticket.quantity} seats are available now, booking quantity exceeded.` });
    return;
  }

  // Process Stripe token mock
  const { stripeToken, cardDetails } = req.body;
  if (!stripeToken && !cardDetails) {
    res.status(400).json({ message: "Payment details missing" });
    return;
  }

  // Reduce Ticket Quantity
  ticket.quantity = ticket.quantity - booking.quantity;
  
  // Status changes to Paid
  booking.status = "Paid";
  
  // Generate Transaction Id
  const paymentTxId = "txn_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  booking.transactionId = paymentTxId;

  // Save Transaction
  const newTx: Transaction = {
    id: "tx_" + Math.random().toString(36).substr(2, 9),
    transactionId: paymentTxId,
    amount: booking.totalPrice,
    ticketTitle: booking.ticketTitle,
    paymentDate: new Date().toISOString(),
    userEmail: booking.userEmail,
    vendorEmail: booking.vendorEmail
  };

  transactions.push(newTx);
  saveDB();

  res.json({
    message: "Stripe payment processed successfully! Ticket quantity updated.",
    transactionId: paymentTxId,
    booking
  });
});

// View My Transaction History details
app.get("/api/transactions/my", verifyToken, (req: AuthenticatedRequest, res: Response) => {
  const { transactions } = loadDB();
  const results = transactions.filter(t => t.userEmail.toLowerCase() === req.user?.email.toLowerCase());
  res.json(results);
});


// --- VENDOR OPERATIONS (JWT Protected && Role Check) ---

const verifyVendor = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "Vendor") {
    res.status(403).json({ message: "Access restricted. Vendor credentials needed." });
    return;
  }
  // Check if vendor accounts are fraud
  const { users } = loadDB();
  const user = users.find(u => u.id === req.user?.id);
  if (user?.isFraud) {
    res.status(403).json({ message: "Your vendor operations are suspended because your account is flagged as fraud." });
    return;
  }
  next();
};

// Vendor Add Ticket URL Form
app.post("/api/tickets", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response): void => {
  const { tickets } = loadDB();
  const { title, from, to, transportType, price, quantity, departureTime, perks, image } = req.body;

  if (!title || !from || !to || !transportType || !price || isNaN(price) || isNaN(quantity)) {
    res.status(400).json({ message: "Please specify all required ticketing details" });
    return;
  }

  const defaultImages = {
    Bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
    Train: "https://images.unsplash.com/photo-1519642918688-7e43b190123f?auto=format&fit=crop&q=80&w=600",
    Launch: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600",
    Plane: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=600"
  };

  const newTicket: Ticket = {
    id: "tkt_" + Math.random().toString(36).substr(2, 9),
    title,
    from,
    to,
    transportType,
    price: Number(price),
    quantity: Number(quantity),
    departureTime: departureTime || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    perks: Array.isArray(perks) ? perks : perks?.split(",").map((p: string) => p.trim()) || [],
    image: image || defaultImages[transportType as keyof typeof defaultImages] || defaultImages.Bus,
    vendorName: req.user!.name,
    vendorEmail: req.user!.email,
    status: "Pending", // Starts as Pending
    advertised: false
  };

  tickets.push(newTicket);
  saveDB();

  res.status(201).json({
    message: "Ticket added successfully. Waiting for admin approval.",
    ticket: newTicket
  });
});

// Update Added Ticket Details
app.put("/api/tickets/:id", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response): void => {
  const { tickets } = loadDB();
  const ticket = tickets.find(t => t.id === req.params.id && t.vendorEmail.toLowerCase() === req.user?.email.toLowerCase());

  if (!ticket) {
    res.status(404).json({ message: "Ticket representation not found" });
    return;
  }

  // Block edit if rejected
  if (ticket.status === "Rejected") {
    res.status(400).json({ message: "Rejected tickets cannot be modified. Under audit." });
    return;
  }

  const { title, from, to, transportType, price, quantity, departureTime, perks, image } = req.body;
  if (title) ticket.title = title;
  if (from) ticket.from = from;
  if (to) ticket.to = to;
  if (transportType) ticket.transportType = transportType;
  if (price) ticket.price = Number(price);
  if (quantity !== undefined) ticket.quantity = Number(quantity);
  if (departureTime) ticket.departureTime = departureTime;
  if (image) ticket.image = image;
  if (perks) {
    ticket.perks = Array.isArray(perks) ? perks : perks.split(",").map((p: string) => p.trim());
  }

  ticket.status = "Pending"; // Changes reset approval state

  saveDB();
  res.json({ message: "Ticket updated successfully. Retendered for Admin validation.", ticket });
});

// Delete added ticket
app.delete("/api/tickets/:id", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response): void => {
  const { tickets } = loadDB();
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id && t.vendorEmail.toLowerCase() === req.user?.email.toLowerCase());

  if (ticketIndex === -1) {
    res.status(404).json({ message: "Ticket not found or access denied" });
    return;
  }

  const ticket = tickets[ticketIndex];
  if (ticket.status === "Rejected") {
    res.status(400).json({ message: "Rejected tickets cannot be deleted." });
    return;
  }

  tickets.splice(ticketIndex, 1);
  saveDB();

  res.json({ message: "Ticket deleted successfully." });
});

// Get Vendor Added Tickets
app.get("/api/vendor/tickets", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response) => {
  const { tickets } = loadDB();
  const results = tickets.filter(t => t.vendorEmail.toLowerCase() === req.user?.email.toLowerCase());
  res.json(results);
});

// Get Requested Bookings (Vendor table list)
app.get("/api/bookings/requested", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response) => {
  const { bookings } = loadDB();
  const results = bookings.filter(b => b.vendorEmail.toLowerCase() === req.user?.email.toLowerCase());
  res.json(results);
});

// Accept or Reject User Booking request
app.post("/api/bookings/:id/action", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response): void => {
  const { bookings } = loadDB();
  const { action } = req.body; // "Accept" or "Reject"
  
  const booking = bookings.find(b => b.id === req.params.id && b.vendorEmail.toLowerCase() === req.user?.email.toLowerCase());
  if (!booking) {
    res.status(404).json({ message: "Requested booking record wasn't found" });
    return;
  }

  if (booking.status !== "Pending") {
    res.status(400).json({ message: `This booking is already in ${booking.status} state` });
    return;
  }

  if (action === "Accept") {
    booking.status = "Accepted";
  } else if (action === "Reject") {
    booking.status = "Rejected";
  } else {
    res.status(400).json({ message: "Specify standard Action code Accept or Reject" });
    return;
  }

  saveDB();
  res.json({ message: `Booking ticket request is ${booking.status} successfully`, booking });
});

// Vendor Revenue Overview Insights datasets
app.get("/api/vendor/revenue", verifyToken, verifyVendor, (req: AuthenticatedRequest, res: Response) => {
  const { tickets, bookings, transactions } = loadDB();
  const vendorEmail = req.user!.email.toLowerCase();

  const myTickets = tickets.filter(t => t.vendorEmail.toLowerCase() === vendorEmail);
  const totalTicketsAdded = myTickets.length;

  const myPaidBookings = bookings.filter(b => b.vendorEmail.toLowerCase() === vendorEmail && b.status === "Paid");
  const totalTicketsSold = myPaidBookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = myPaidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Quick statistics breakdown for chart
  const categories = { Bus: 0, Train: 0, Launch: 0, Plane: 0 };
  const revenueByCategory = { Bus: 0, Train: 0, Launch: 0, Plane: 0 };

  myTickets.forEach(t => {
    if (categories[t.transportType] !== undefined) {
      categories[t.transportType] += t.quantity;
    }
  });

  myPaidBookings.forEach(b => {
    const origTicket = tickets.find(t => t.id === b.ticketId);
    if (origTicket && revenueByCategory[origTicket.transportType] !== undefined) {
      revenueByCategory[origTicket.transportType] += b.totalPrice;
    }
  });

  const categoryChartData = Object.keys(categories).map(key => ({
    name: key,
    seatsAdded: categories[key as keyof typeof categories],
    revenue: revenueByCategory[key as keyof typeof revenueByCategory],
  }));

  res.json({
    totalTicketsAdded,
    totalTicketsSold,
    totalRevenue,
    categoryChartData
  });
});


// --- ADMIN MANAGEMENT CHANNELS (JWT Protected && Admin Role) ---

const verifyAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ message: "Access forbidden. Administrator credentials are required." });
    return;
  }
  next();
};

// Admin manage tickets: get all tickets list
app.get("/api/admin/tickets", verifyToken, verifyAdmin, (req: Request, res: Response) => {
  const { tickets } = loadDB();
  res.json(tickets);
});

// Admin action: approve or reject ticket
app.post("/api/admin/tickets/:id/action", verifyToken, verifyAdmin, (req: Request, res: Response): void => {
  const { tickets } = loadDB();
  const { action } = req.body; // "Approve" or "Reject"
  
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) {
    res.status(404).json({ message: "Ticket representation not found" });
    return;
  }

  if (action === "Approve") {
    ticket.status = "Approved";
  } else if (action === "Reject") {
    ticket.status = "Rejected";
  } else {
    res.status(400).json({ message: "Action code is invalid. Choose Approve or Reject" });
    return;
  }

  saveDB();
  res.json({ message: `Ticket is successfully status set to ${ticket.status}`, ticket });
});

// Admin toggle advertisement, max 6
app.post("/api/admin/tickets/:id/advertise", verifyToken, verifyAdmin, (req: Request, res: Response): void => {
  const { tickets } = loadDB();
  const ticket = tickets.find(t => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  if (ticket.status !== "Approved") {
    res.status(400).json({ message: "Only Approved tickets can be advertised on home carousel" });
    return;
  }

  const { value } = req.body; // boolean
  
  if (value === true) {
    // Check maximum 6 advertised tickets
    const advertisedCount = tickets.filter(t => t.advertised && t.status === "Approved").length;
    if (advertisedCount >= 6) {
      res.status(400).json({ message: "You have exceeded the maximum of 6 Home advertisement selections. Please unadvertise an older selection first." });
      return;
    }
  }

  ticket.advertised = !!value;
  saveDB();

  res.json({ 
    message: ticket.advertised ? "Ticket successfully set to show in Hero advertising" : "Removed ticket from advertising spots", 
    ticket 
  });
});

// Admin: Get all registered users list
app.get("/api/admin/users", verifyToken, verifyAdmin, (req: Request, res: Response) => {
  const { users } = loadDB();
  // Return users exceptpasswordHashes
  const safeUsers = users.map(({ passwordHash, ...safe }) => safe);
  res.json(safeUsers);
});

// Admin: Update user role (Make Admin/Vendor)
app.put("/api/admin/users/:userId/role", verifyToken, verifyAdmin, (req: Request, res: Response): void => {
  const { users } = loadDB();
  const dbUser = users.find(u => u.id === req.params.userId);

  if (!dbUser) {
    res.status(404).json({ message: "Registered user record not found" });
    return;
  }

  const { role } = req.body;
  if (role !== "Admin" && role !== "Vendor" && role !== "User") {
    res.status(400).json({ message: "Enter standard user role value Admin, Vendor or User" });
    return;
  }

  dbUser.role = role;
  saveDB();

  res.json({ message: `User role modified to ${role} successfully.`, user: dbUser });
});

// Admin: Mark user as Fraud (suspends vendor, hides their tickets, blocks booking)
app.put("/api/admin/users/:userId/fraud", verifyToken, verifyAdmin, (req: Request, res: Response): void => {
  const { users, tickets } = loadDB();
  const dbUser = users.find(u => u.id === req.params.userId);

  if (!dbUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { isFraud } = req.body;
  dbUser.isFraud = !!isFraud;

  // Let's hide any of their tickets if they are vendor
  if (dbUser.isFraud && dbUser.role === "Vendor") {
    // Unadvertised and Pending/Rejected standardizer logic can go here,
    // although our query "/api/tickets" already checks if the vendor is fraud dynamically!
  }

  saveDB();
  res.json({ 
    message: dbUser.isFraud 
      ? `User marked as fraud. All tickets automatically hidden and operations suspended.` 
      : `User fraud flag cleared. Operations restored.`,
    user: dbUser 
  });
});


// Serve React build in Production and run Vite dev server in non-production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TicketBari Server running on http://0.0.0.0:${PORT}`);
  });
}

// Global server error safety
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection inside TicketBari platform:", err);
});

startServer();
