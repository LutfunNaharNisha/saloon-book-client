export const formatCurrency = (amount: number, currency = "USD") =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
		maximumFractionDigits: 2,
	}).format(Number.isFinite(amount) ? amount : 0);

export const formatDate = (value?: string | Date | null) => {
	if (!value) return "—";
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

export const formatDateTime = (value?: string | Date | null) => {
	if (!value) return "—";
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
};

export const formatDuration = (minutes: number) => {
	const value = Number(minutes) || 0;
	if (value < 60) return `${value} min`;
	const hours = Math.floor(value / 60);
	const rest = value % 60;
	return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

export const shortRef = (value?: string, length = 12) => {
	if (!value) return "—";
	return value.length > length ? `${value.slice(0, length)}…` : value;
};

export const todayInputValue = () => {
	const now = new Date();
	const offset = now.getTimezoneOffset() * 60 * 1000;
	return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export const initials = (name?: string) => {
	if (!name) return "SB";
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
};

export const titleCase = (value?: string) => {
	if (!value) return "";
	return value.charAt(0).toUpperCase() + value.slice(1);
};
