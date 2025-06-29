import { PUBLIC_GOOGLE_ANALYTICS_ID } from "astro:env/client";
import { useEffect, useState } from "react";

const COOKIE_KEY = "rplayer:cookies";

const CookieConsent = () => {
	const [cookiesAccepted, setCookiesAccepted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const acceptCookies = () => {
		setCookiesAccepted(true);
		const script = document.createElement("script");
		script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GOOGLE_ANALYTICS_ID}`;
		script.async = true;
		document.body.appendChild(script);

		const gaScript = document.createElement("script");
		gaScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', '${PUBLIC_GOOGLE_ANALYTICS_ID}');
    `;
		document.body.appendChild(gaScript);
	};

	useEffect(() => {
		const consent = localStorage.getItem(COOKIE_KEY);
		if (consent) {
			setCookiesAccepted(true);
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (cookiesAccepted) {
			localStorage.setItem(COOKIE_KEY, "true");
		}
	}, [cookiesAccepted]);

	if (isLoading) {
		return null;
	}

	return (
		!cookiesAccepted && (
			<section className="w-full mb-6 p-6 rounded-md bg-primary text-black text-center">
				<p className="mb-4 text-sm">
					We use cookies to enhance your experience and analyze site traffic (Google Analytics). By
					accepting, you consent to their use for saving your preferences and visit statistics.
				</p>
				<button
					type="button"
					onClick={acceptCookies}
					className="px-4 py-2 rounded border-2 font-bold transition-colors cursor-pointer border-neutral-800 text-neutral-700 hover:bg-neutral-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-opacity-50"
				>
					Accept
				</button>
			</section>
		)
	);
};

export default CookieConsent;
