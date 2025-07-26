import { useEffect, useState } from "react";

export enum ToastType {
	SUCCESS = "success",
	ERROR = "error",
	INFO = "info",
	WARNING = "warning",
}

interface ToastProps {
	message: string;
	type?: ToastType;
	autoClose?: boolean;
}

const typeStyles = {
	[ToastType.SUCCESS]: "bg-green-100 border-green-500 text-green-700",
	[ToastType.ERROR]: "bg-red-100 border-red-500 text-red-700",
	[ToastType.INFO]: "bg-blue-100 border-blue-500 text-blue-700",
	[ToastType.WARNING]: "bg-yellow-100 border-yellow-500 text-yellow-700",
};

const Toast = ({ message, type = ToastType.INFO, autoClose = true }: ToastProps) => {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		if (!message) return;
		setVisible(true);
		if (autoClose !== false) {
			const duration = 3000;
			const timer = setTimeout(() => setVisible(false), duration);
			return () => clearTimeout(timer);
		}
	}, [message, autoClose]);

	if (!visible) return null;

	return (
		<div
			className={`fixed bottom-4 right-4 border-l-4 p-4 rounded shadow-lg z-50 transition-all ${typeStyles[type]}`}
			role="alert"
		>
			<span>{message}</span>
		</div>
	);
};

export default Toast;
