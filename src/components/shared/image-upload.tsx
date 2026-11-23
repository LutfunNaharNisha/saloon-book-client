"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { getErrorMessage } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageUpload({
	value,
	onChange,
	label = "Image",
	allowUrl = true,
	id = "image-upload",
}: {
	value: string;
	onChange: (url: string) => void;
	label?: string;
	allowUrl?: boolean;
	id?: string;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	const handleFile = async (file?: File) => {
		if (!file) return;
		setUploading(true);
		try {
			const url = await uploadImageToImgBB(file);
			if (!url) throw new Error("The upload did not return an image URL.");
			onChange(url);
			toast.success("Image uploaded successfully.");
		} catch (error) {
			toast.error(getErrorMessage(error, "Image upload failed."));
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div
					className={cn(
						"relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted",
						value && "border-primary/40",
					)}
				>
					{value ? (
						<Image
							src={value}
							alt="Selected image preview"
							fill
							unoptimized
							sizes="96px"
							className="object-cover"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							<ImagePlus className="h-6 w-6" />
						</div>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<input
						ref={inputRef}
						id={id}
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						className="hidden"
						onChange={(event) => void handleFile(event.target.files?.[0])}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={uploading}
						onClick={() => inputRef.current?.click()}
					>
						{uploading ? (
							<>
								<Loader2 className="animate-spin" /> Uploading...
							</>
						) : (
							<>
								<ImagePlus /> {value ? "Replace image" : "Upload image"}
							</>
						)}
					</Button>
					{value ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onChange("")}
						>
							<Trash2 /> Remove
						</Button>
					) : null}
					<p className="w-full text-xs text-muted-foreground">
						JPG, PNG, WEBP or GIF up to 5 MB.
					</p>
				</div>
			</div>

			{allowUrl ? (
				<Input
					type="url"
					placeholder="Or paste an image URL"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					aria-label={`${label} URL`}
				/>
			) : null}
		</div>
	);
}
