import { useEffect, useState } from "react";

const CookieBar = () => {
	const [cookiesAccepted, setCookiesAccepted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const acceptCookies = () => {
		setCookiesAccepted(true);
		const script = document.createElement("script");
		script.src = "https://www.googletagmanager.com/gtag/js?id=G-XDNK03GJLB";
		script.async = true;
		document.body.appendChild(script);

		const gaScript = document.createElement("script");
		gaScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-XDNK03GJLB');
    `;
		document.body.appendChild(gaScript);
	};

	useEffect(() => {
		const consent = localStorage.getItem("cookiesAccepted");
		if (consent) {
			setCookiesAccepted(true);
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (cookiesAccepted) {
			localStorage.setItem("cookiesAccepted", "true");
		}
	}, [cookiesAccepted]);

	if (isLoading) {
		return null;
	}

	return (
		!cookiesAccepted && (
			<section className="w-full bg-black text-center border-t border-secondary flex items-center justify-center shadow-lg">
				<div className="max-w-5xl mx-auto p-4 sm:p-6">
					<p className="mb-4 text-sm text-gray-100">
						This site uses Google Analytics to measure audience and improve our service. By clicking
						"Accept", you help us provide a better experience. We also store your player volume and
						last stream URL locally for your convenience.
					</p>
					<button
						type="button"
						onClick={acceptCookies}
						className="border-2 border-primary hover:bg-primary hover:text-black text-primary font-bold px-4 py-2 rounded transition-colors"
					>
						Accept
					</button>
				</div>
			</section>
		)
	);
};

export default CookieBar;
