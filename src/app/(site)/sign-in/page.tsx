import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { LoadingScreen } from "@/components/shared/loading-screen";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
	return (
		<AuthShell
			title="Welcome back"
			description="Sign in to manage your salon appointments and payments."
		>
			<Suspense fallback={<LoadingScreen label="Preparing sign in..." />}>
				<SignInForm />
			</Suspense>
		</AuthShell>
	);
}
