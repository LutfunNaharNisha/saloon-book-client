export type Role = "admin" | "customer";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type ServiceStatus = "active" | "inactive";
export type TransactionStatus = "paid" | "failed";

export interface AppUser {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	role: Role | string;
	isBlocked?: boolean;
	phone?: string;
	createdAt?: string;
}

export interface Service {
	_id: string;
	serviceName: string;
	category: string;
	description: string;
	price: number;
	duration: number;
	image: string;
	status: ServiceStatus;
	createdAt: string;
}

export interface AppointmentService {
	_id: string;
	serviceName: string;
	category: string;
	duration?: number;
	image?: string;
	status?: ServiceStatus;
}

export interface AppointmentCustomer {
	_id: string;
	name: string;
	email: string;
	image?: string;
	phone?: string;
	isBlocked?: boolean;
}

export interface Appointment {
	_id: string;
	serviceId: AppointmentService | string | null;
	customerId: string;
	appointmentDate: string;
	timeSlot: string;
	message?: string;
	servicePrice: number;
	paymentStatus: PaymentStatus;
	status: AppointmentStatus;
	createdAt: string;
	// Aggregated fields returned by the admin API
	service?: AppointmentService;
	customer?: AppointmentCustomer;
}

export interface Customer {
	_id: string;
	name: string;
	email: string;
	image?: string;
	phone?: string;
	role: Role | string;
	isBlocked?: boolean;
	createdAt?: string;
	appointmentCount?: number;
}

export interface Transaction {
	_id: string;
	appointmentId: Appointment | string | null;
	customerId: string;
	amount: number;
	currency: string;
	stripeSessionId: string;
	status: TransactionStatus;
	createdAt: string;
	customer?: AppointmentCustomer;
	appointment?: Appointment;
	service?: AppointmentService;
}

export interface CustomerStats {
	totalAppointments: number;
	pendingCount: number;
	confirmedCount: number;
	cancelledCount: number;
	totalSpent: number;
}

export interface CustomerDashboardData {
	stats: CustomerStats;
	appointments: Appointment[];
	transactions: Transaction[];
}

export interface AdminDashboardData {
	totalCustomers: number;
	totalActiveServices: number;
	totalServices: number;
	totalAppointments: number;
	pendingAppointments: number;
	confirmedAppointments: number;
	cancelledAppointments: number;
	successfulPayments: number;
	totalRevenue: number;
	recentAppointments: Appointment[];
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	count?: number;
}
