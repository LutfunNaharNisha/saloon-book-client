"use client";

import { LoadingScreen } from "@/components/shared/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { homeForRole, safeCallback } from "@/lib/auth-paths";
import { APP_URL } from "@/lib/constants";
import { getErrorMessage } from "@/lib/data";
import { isValidEmail } from "@/lib/validators";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";

export function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = safeCallback(searchParams.get("callbackUrl"));
	const { user, isPending, refreshSession } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	useEffect(() => {
		if (!isPending && user) router.replace(homeForRole(user.role));
	}, [isPending, router, user]);

	if (isPending || user) {
		return <LoadingScreen label="Checking your session..." />;
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!isValidEmail(email)) {
			toast.error("Please enter a valid email address.");
			return;
		}
		if (!password) {
			toast.error("Please enter your password.");
			return;
		}

		setSubmitting(true);
		try {
			const result = await authClient.signIn.email({ email, password });
			if (result?.error) {
				toast.error(
					result.error.message || "Email or password is incorrect.",
				);
				return;
			}
			await refreshSession();
			toast.success("Welcome back to SalonBook!");
			router.replace(callbackUrl || "/dashboard");
			router.refresh();
		} catch (error) {
			toast.error(
				getErrorMessage(error, "Unable to sign in. Please try again."),
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleGoogle = async () => {
		setGoogleLoading(true);
		try {
			const result = await authClient.signIn.social({
				provider: "google",
				callbackURL: new URL(
					callbackUrl || "/dashboard",
					APP_URL,
				).toString(),
			});
			if (result?.error) {
				toast.error(
					result.error.message || "Google sign-in is not available.",
				);
				return;
			}
			const url = (result?.data as { url?: string } | null)?.url;
			if (url) window.location.assign(url);
			else toast.info("Redirecting to Google...");
		} catch (error) {
			toast.error(
				getErrorMessage(error, "Unable to start Google sign-in."),
			);
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<div className="space-y-5">
			<form
				onSubmit={handleSubmit}
				className="space-y-4"
				noValidate
			>
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="pl-9"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<Link
							href="/sign-up"
							className="text-xs text-muted-foreground hover:text-primary"
						>
							Need an account?
						</Link>
					</div>
					<div className="relative">
						<LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							autoComplete="current-password"
							placeholder="Your password"
							value={password}
							onChange={(event) =>
								setPassword(event.target.value)
							}
							className="pl-9 pr-10"
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-0 top-0 h-10 w-10"
							aria-label={
								showPassword ? "Hide password" : "Show password"
							}
							onClick={() =>
								setShowPassword((visible) => !visible)
							}
						>
							{showPassword ? <EyeOff /> : <Eye />}
						</Button>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={submitting}
				>
					{submitting ? (
						<>
							<Loader2 className="animate-spin" /> Signing in...
						</>
					) : (
						"Sign in"
					)}
				</Button>
			</form>

			{/* <div className="flex items-center gap-3">
				<Separator />
				<span className="text-xs text-muted-foreground">
					OR CONTINUE WITH
				</span>
				<Separator />
			</div> */}

			<div className="flex items-center gap-3 w-full">
				<Separator className="flex-1 w-auto" />
				<span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
					OR CONTINUE WITH
				</span>
				<Separator className="flex-1 w-auto" />
			</div>

			<Button
				type="button"
				variant="outline"
				className="w-full"
				disabled={googleLoading}
				onClick={() => void handleGoogle()}
			>
				{googleLoading ? (
					<Loader2 className="animate-spin" />
				) : (
					<svg
						viewBox="0 0 24 24"
						className="h-4 w-4"
						aria-hidden="true"
					>
						<path
							fill="currentColor"
							d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
						/>
						<path
							fill="currentColor"
							d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4H3v2.6A10 10 0 0 0 12 22Z"
						/>
						<path
							fill="currentColor"
							d="M6.4 14.1a6 6 0 0 1 0-4.2V7.3H3a10 10 0 0 0 0 9.4l3.4-2.6Z"
						/>
						<path
							fill="currentColor"
							d="M12 6.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3 7.3l3.4 2.6C7.2 8.6 9.4 6.9 12 6.9Z"
						/>
					</svg>
				)}
				Continue with Google
			</Button>

			<p className="text-center text-sm text-muted-foreground">
				New to SalonBook?{" "}
				<Link
					href="/sign-up"
					className="font-medium text-primary hover:underline"
				>
					Create an account
				</Link>
			</p>
		</div>
	);
}
