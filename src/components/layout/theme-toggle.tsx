"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();

	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme === "dark";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label={mounted && isDark ? "Switch to light theme" : "Switch to dark theme"}
			title={mounted && isDark ? "Light mode" : "Dark mode"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{mounted && isDark ? <Sun /> : <Moon />}
		</Button>
	);
}
