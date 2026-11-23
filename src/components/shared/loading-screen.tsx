import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingScreen({
	label = "Loading SalonBook...",
	className,
}: {
	label?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex min-h-[55vh] w-full flex-col items-center justify-center gap-3 text-center",
				className,
			)}
			role="status"
			aria-live="polite"
		>
			<Loader2 className="h-7 w-7 animate-spin text-primary" />
			<p className="text-sm text-muted-foreground">{label}</p>
		</div>
	);
}
