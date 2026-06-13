import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function InfoPanel({
	title,
	description,
	subdescription,
	buttonText,
	onButtonClick,
	image,
	name,
	children,
	topRight,
	buttons,
	icon = Plus,
}) {
	return (
		<>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] text-left">
					{title}
				</h2>
				{topRight && <div>{topRight}</div>}
			</div>
			<div className="flex items-center justify-center min-h-[calc(100vh-220px)]">
				<div className="text-center mx-auto">
					<div className="mb-6 mt-9">
						{image ? (
							<img
								src={image}
								alt={name || "Empty"}
								className="w-72 h-56 mx-auto rounded-lg"
							/>
						) : (
							<div className="h-80 w-80 mx-auto bg-[var(--color-admin-profile-border)]"></div>
						)}
					</div>
					{name && (
						<h2 className="text-lg font-semibold text-[var(--color-neutral-primary)] mb-4">
							{name}
						</h2>
					)}
					<p className="text-[var(--color-neutral-secondary)] text-base mb-6 leading-relaxed">
						{description}
						<br />
						{subdescription}
					</p>
					{buttons && buttons.length > 0 ? (
						<div className="flex gap-4 justify-center mb-4">
							{buttons.map((btn, idx) => (
								<>
									{btn.href ? (
										<Link href={btn.href}>
											<Button
												key={idx}
												onClick={btn.onClick}
												className={btn.className}
												size="md"
												variant={btn.variant}
											>
												{btn.icon && (
													<Icon
														name={btn.icon}
														className="w-4 h-4 mr-2"
													/>
												)}
												{btn.text}
											</Button>
										</Link>
									) : (
										<Button
											key={idx}
											onClick={btn.onClick}
											className={btn.className}
											size="md"
											variant={btn.variant}
										>
											{btn.icon && (
												<Icon
													name={btn.icon}
													className="w-4 h-4 mr-2"
												/>
											)}
											{btn.text}
										</Button>
									)}
								</>
							))}
						</div>
					) : buttonText ? (
						<Button
							size="md"
							className="btn-size-md inline-flex items-center space-x-2 btn-primary font-medium"
							onClick={onButtonClick}
						>
							<Plus />
							<span>{buttonText}</span>
						</Button>
					) : null}
					{children}
				</div>
			</div>
		</>
	);
}
