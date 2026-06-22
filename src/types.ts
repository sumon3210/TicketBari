export interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Vendor" | "Admin";
  profilePic: string;
  isFraud: boolean;
}

export type TransportType = "Bus" | "Train" | "Launch" | "Plane";

export interface Ticket {
  id: string;
  title: string;
  from: string;
  to: string;
  transportType: TransportType;
  price: number;
  quantity: number;
  departureTime: string; // ISO String
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
  route: string;
  departureTime: string;
  status: "Pending" | "Accepted" | "Rejected" | "Paid";
  transactionId?: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  ticketTitle: string;
  paymentDate: string;
  userEmail: string;
  vendorEmail: string;
}
