import { Badge, type BadgeProps } from "@/components/ui/badge";
import { titleCase } from "@/lib/format";

type Props = {
	value?: string | null;
	type?: "appointment" | "payment" | "transaction";
};

const variantFor = (value: string, type: Props["type"]): BadgeProps["variant"] => {
	const normalized = value.toLowerCase();
	if (normalized === "confirmed" || normalized === "paid") return "success";
	if (normalized === "pending" || normalized === "unpaid") return "warning";
	if (normalized === "failed") return "destructive";
	if (normalized === "cancelled" || normalized === "canceled") return "danger";
	if (type === "transaction" && normalized === "completed") return "success";
	return "secondary";
};

export function StatusBadge({ value, type = "appointment" }: Props) {
	const text = value || "—";
	return (
		<Badge variant={variantFor(text, type)} className="capitalize">
			{titleCase(text)}
		</Badge>
	);
}
