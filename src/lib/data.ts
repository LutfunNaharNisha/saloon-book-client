import type {
	Appointment,
	AppointmentCustomer,
	AppointmentService,
	Transaction,
} from "./types";

export type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord =>
	Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Handles responses such as [], { data: [] }, or { services: [] }. */
export function asArray<T>(payload: unknown, keys: string[] = []): T[] {
	if (Array.isArray(payload)) return payload as T[];
	if (!isRecord(payload)) return [];

	const preferred = [
		"data",
		"items",
		"results",
		"services",
		"appointments",
		"customers",
		"users",
		"transactions",
		...keys,
	];

	for (const key of preferred) {
		const value = payload[key];
		if (Array.isArray(value)) return value as T[];
	}

	return [];
}

export function asRecord(payload: unknown): UnknownRecord | null {
	if (Array.isArray(payload) || !isRecord(payload)) return null;
	if (isRecord(payload.data)) return payload.data;
	return payload;
}

export function readStats(payload: unknown): UnknownRecord {
	const record = asRecord(payload);
	if (!record) return {};
	return isRecord(record.stats) ? record.stats : record;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
	if (error instanceof Error) return error.message || fallback;
	if (isRecord(error) && typeof error.message === "string") {
		return error.message;
	}
	if (typeof error === "string" && error.trim()) return error;
	return fallback;
}

export function numberFrom(value: unknown, fallback = 0): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return fallback;
}

export function serviceIdOf(
	service: AppointmentService | AppointmentService[] | string | null | undefined,
): string | null {
	if (Array.isArray(service)) return service[0]?._id ?? null;
	if (!service) return null;
	return typeof service === "string" ? service : service._id ?? null;
}

export function appointmentServiceOf(
	appointment: Partial<Appointment> | null | undefined,
): AppointmentService | null {
	if (!appointment) return null;
	const fromPopulated = appointment.service;
	const fromId = appointment.serviceId;
	if (fromPopulated && !Array.isArray(fromPopulated)) return fromPopulated;
	if (fromId && !Array.isArray(fromId) && typeof fromId !== "string") {
		return fromId;
	}
	return null;
}

export function appointmentCustomerOf(
	appointment: Partial<Appointment> | null | undefined,
): AppointmentCustomer | null {
	if (!appointment) return null;
	const customer = appointment.customer;
	if (customer && !Array.isArray(customer)) return customer;
	return null;
}

export function transactionAppointmentOf(
	transaction: Partial<Transaction> | null | undefined,
): Appointment | null {
	if (!transaction) return null;
	const appointment = transaction.appointment;
	if (appointment && !Array.isArray(appointment)) return appointment;
	const fromId = transaction.appointmentId;
	if (fromId && !Array.isArray(fromId) && typeof fromId !== "string") {
		return fromId;
	}
	return null;
}
