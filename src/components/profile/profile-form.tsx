"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/data";
import { useAuth } from "@/components/auth/auth-provider";
import { ImageUpload } from "@/components/shared/image-upload";
import { PageHeader } from "@/components/dashboard/dashboard-parts";
import { Badge } from "@/components/ui/badge";
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

export function ProfileForm() {
	const { user, refreshSession } = useAuth();
	const [name, setName] = useState(user?.name || "");
	const [phone, setPhone] = useState(user?.phone || "");
	const [image, setImage] = useState(user?.image || "");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!name.trim()) {
			toast.error("Name cannot be empty.");
			return;
		}

		setSaving(true);
		try {
			const result = await (
				authClient as unknown as {
					updateUser: (input: {
						name: string;
						image?: string;
						phone?: string;
					}) => Promise<{ error?: { message?: string } | null }>;
				}
			).updateUser({
				name: name.trim(),
				image: image || undefined,
				phone: phone.trim() || undefined,
			});

			if (result?.error) {
				toast.error(result.error.message || "Unable to update your profile.");
				return;
			}

			await refreshSession();
			toast.success("Profile updated successfully.");
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to update your profile."));
		} finally {
			setSaving(false);
		}
	};

	if (!user) return null;

	return (
		<>
			<PageHeader
				title="My profile"
				description="Update the personal details shown on your SalonBook account."
			/>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<Card>
					<CardHeader>
						<CardTitle>Profile information</CardTitle>
						<CardDescription>
							Only your name, photo and phone number can be changed here.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="profileName">Full name</Label>
								<Input
									id="profileName"
									value={name}
									onChange={(event) => setName(event.target.value)}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="profileEmail">Email address</Label>
								<Input
									id="profileEmail"
									type="email"
									value={user.email}
									disabled
									readOnly
								/>
								<p className="text-xs text-muted-foreground">
									Email changes require administrator support.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="profilePhone">Phone number</Label>
								<Input
									id="profilePhone"
									type="tel"
									placeholder="+1 (555) 000-0000"
									value={phone}
									onChange={(event) => setPhone(event.target.value)}
								/>
							</div>

							<ImageUpload
								id="profile-image"
								label="Profile image"
								value={image}
								onChange={setImage}
							/>

							<Button type="submit" disabled={saving}>
								{saving ? (
									<>
										<Loader2 className="animate-spin" /> Saving...
									</>
								) : (
									<>
										<Save /> Save changes
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Account details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">Role</span>
								<Badge variant="secondary" className="capitalize">
									{String(user.role)}
								</Badge>
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">Status</span>
								<Badge variant={user.isBlocked ? "destructive" : "success"}>
									{user.isBlocked ? "Blocked" : "Active"}
								</Badge>
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">User ID</span>
								<span className="max-w-32 truncate font-mono text-xs">
									{user.id}
								</span>
							</div>
						</CardContent>
					</Card>
					<div className="flex gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
						<ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
						<p>
							Your role and account status are managed securely by the salon
							administrator and cannot be changed from this page.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
