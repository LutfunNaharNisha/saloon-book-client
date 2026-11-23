export const PASSWORD_RULES = [
	{ label: "At least 6 characters", test: (value: string) => value.length >= 6 },
	{
		label: "One uppercase letter",
		test: (value: string) => /[A-Z]/.test(value),
	},
	{
		label: "One lowercase letter",
		test: (value: string) => /[a-z]/.test(value),
	},
];

export const getPasswordError = (password: string) => {
	if (password.length < 6) return "Password must be at least 6 characters.";
	if (!/[A-Z]/.test(password))
		return "Password must contain at least one uppercase letter.";
	if (!/[a-z]/.test(password))
		return "Password must contain at least one lowercase letter.";
	return null;
};

export const isValidEmail = (email: string) =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export type ServiceFormValues = {
	serviceName: string;
	category: string;
	description: string;
	price: string;
	duration: string;
	image: string;
	status: "active" | "inactive";
};

export const validateServiceForm = (values: ServiceFormValues) => {
	const errors: Partial<Record<keyof ServiceFormValues, string>> = {};

	if (!values.serviceName.trim()) {
		errors.serviceName = "Service name is required.";
	}
	if (!values.category.trim()) {
		errors.category = "Please choose a category.";
	}
	if (!values.description.trim() || values.description.trim().length < 20) {
		errors.description = "Please write at least 20 characters.";
	}

	const price = Number(values.price);
	if (!Number.isFinite(price) || price <= 0) {
		errors.price = "Price must be a positive number.";
	}

	const duration = Number(values.duration);
	if (!Number.isFinite(duration) || duration <= 0) {
		errors.duration = "Duration must be a positive number.";
	}

	if (!values.image) {
		errors.image = "Please upload a service image.";
	}

	return errors;
};
