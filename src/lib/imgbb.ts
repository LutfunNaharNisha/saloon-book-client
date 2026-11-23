"use client";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const validateImageFile = (file: File) => {
	if (!ALLOWED.includes(file.type)) {
		throw new Error("Please choose a JPG, PNG, WEBP or GIF image.");
	}
	if (file.size > MAX_SIZE) {
		throw new Error("Image is too large. Maximum size is 5 MB.");
	}
};

export async function uploadImageToImgBB(file: File): Promise<string> {
	validateImageFile(file);

	const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
	if (!key || key.startsWith("replace_")) {
		throw new Error(
			"Image upload is not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to the client environment.",
		);
	}

	const form = new FormData();
	form.append("image", file);

	const response = await fetch(
		`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
		{ method: "POST", body: form },
	);

	const result = await response.json().catch(() => null);

	if (!response.ok || !result?.success) {
		throw new Error(
			result?.error?.message ||
				"Image upload failed. Please try again with a smaller image.",
		);
	}

	return (
		result.data?.display_url ||
		result.data?.url ||
		result.data?.image?.url ||
		""
	);
}
