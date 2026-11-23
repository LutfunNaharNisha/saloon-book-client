export const homeForRole = (role?: string | null) =>
	role === "admin" ? "/dashboard/admin" : "/dashboard/customer";

export const profileForRole = (role?: string | null) =>
	role === "admin" ? "/dashboard/admin/profile" : "/dashboard/customer/profile";

export const safeCallback = (value: string | string[] | null | undefined) => {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
		return null;
	}
	return candidate;
};
