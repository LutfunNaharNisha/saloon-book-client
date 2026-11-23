"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/data";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { validateServiceForm, type ServiceFormValues } from "@/lib/validators";
import type { Service } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/dashboard-parts";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ServiceForm({ service }: { service?: Service }) {
	const router = useRouter();
	const isEdit = Boolean(service?._id);

	const [values, setValues] = useState<ServiceFormValues>({
		serviceName: service?.serviceName || "",
		category: service?.category || "",
		description: service?.description || "",
		price: service?.price ? String(service.price) : "",
		duration: service?.duration ? String(service.duration) : "",
		image: service?.image || "",
		status: service?.status || "active",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof ServiceFormValues, string>>
	>({});
	const [saving, setSaving] = useState(false);

	const setField = <K extends keyof ServiceFormValues>(
		key: K,
		value: ServiceFormValues[K],
	) => {
		setValues((current) => ({ ...current, [key]: value }));
		setErrors((current) => ({ ...current, [key]: undefined }));
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const nextErrors = validateServiceForm(values);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) {
			toast.error("Please correct the highlighted fields.");
			return;
		}

		setSaving(true);
		try {
			const payload = {
				serviceName: values.serviceName.trim(),
				category: values.category,
				description: values.description.trim(),
				price: Number(values.price),
				duration: Number(values.duration),
				image: values.image,
				status: values.status,
			};

			if (isEdit) {
				await api.patch(`/api/services/${service?._id}`, payload);
				toast.success("Service updated successfully.");
			} else {
				await api.post("/api/services", payload);
				toast.success("New service added successfully.");
			}
			router.push("/dashboard/admin/services");
			router.refresh();
		} catch (error) {
			toast.error(
				getErrorMessage(error, "Unable to save this service. Please try again."),
			);
		} finally {
			setSaving(false);
		}
	};

	const categories = Array.from(
		new Set([
			...SERVICE_CATEGORIES.map((item) => item.name),
			...(values.category ? [values.category] : []),
		]),
	);

	return (
		<>
			<PageHeader
				title={isEdit ? "Update service" : "Add new service"}
				description={
					isEdit
						? "Edit the details clients see across SalonBook."
						: "Create a new treatment and add it to your service menu."
				}
				actions={
					<Button asChild variant="ghost">
						<Link href="/dashboard/admin/services">
							<ArrowLeft /> Back to services
						</Link>
					</Button>
				}
			/>

			<Card className="max-w-4xl">
				<CardHeader>
					<CardTitle>Service details</CardTitle>
					<CardDescription>
						Price and duration must be positive numbers. Upload a clear service
						image for the best presentation.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-5" noValidate>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="serviceName">Service name</Label>
								<Input
									id="serviceName"
									value={values.serviceName}
									onChange={(event) => setField("serviceName", event.target.value)}
									placeholder="e.g. Classic facial"
								/>
								{errors.serviceName ? (
									<p className="text-xs text-destructive">{errors.serviceName}</p>
								) : null}
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select
									value={values.category}
									onValueChange={(value) => setField("category", value)}
								>
									<SelectTrigger id="category">
										<SelectValue placeholder="Choose a category" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((category) => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.category ? (
									<p className="text-xs text-destructive">{errors.category}</p>
								) : null}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								rows={4}
								value={values.description}
								onChange={(event) => setField("description", event.target.value)}
								placeholder="Describe the treatment, what's included and who it suits..."
							/>
							{errors.description ? (
								<p className="text-xs text-destructive">{errors.description}</p>
							) : null}
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="price">Price (USD)</Label>
								<Input
									id="price"
									type="number"
									min="1"
									step="0.01"
									value={values.price}
									onChange={(event) => setField("price", event.target.value)}
									placeholder="45"
								/>
								{errors.price ? (
									<p className="text-xs text-destructive">{errors.price}</p>
								) : null}
							</div>
							<div className="space-y-2">
								<Label htmlFor="duration">Duration (minutes)</Label>
								<Input
									id="duration"
									type="number"
									min="1"
									step="1"
									value={values.duration}
									onChange={(event) => setField("duration", event.target.value)}
									placeholder="60"
								/>
								{errors.duration ? (
									<p className="text-xs text-destructive">{errors.duration}</p>
								) : null}
							</div>
						</div>

						<div className="space-y-2">
							<ImageUpload
								id="service-image"
								label="Service image (upload required)"
								value={values.image}
								onChange={(url) => setField("image", url)}
								allowUrl={false}
							/>
							{errors.image ? (
								<p className="text-xs text-destructive">{errors.image}</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Service status</Label>
							<Select
								value={values.status}
								onValueChange={(value) =>
									setField("status", value as ServiceFormValues["status"])
								}
							>
								<SelectTrigger id="status" className="max-w-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active — visible to customers</SelectItem>
									<SelectItem value="inactive">
										Inactive — hidden from booking
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-wrap gap-2 pt-2">
							<Button type="submit" disabled={saving}>
								{saving ? (
									<>
										<Loader2 className="animate-spin" /> Saving...
									</>
								) : (
									<>
										<Save /> {isEdit ? "Save changes" : "Add service"}
									</>
								)}
							</Button>
							<Button asChild type="button" variant="outline">
								<Link href="/dashboard/admin/services">Cancel</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
