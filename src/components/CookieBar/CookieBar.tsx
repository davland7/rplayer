import React, { useState, useEffect } from "react";
import translations from "./translations";

interface CookieBarProps {
  lang?: "en" | "fr";
}

const CookieBar = ({ lang = "en" }: CookieBarProps) => {
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

  const t = translations[lang];

  return (
    !cookiesAccepted && (
      <div className="bg-white p-4 text-center">
        <p className="mb-4 text-sm text-gray-700">
          {t.message}
        </p>
        <button
          onClick={acceptCookies}
          className="bg-primary hover:bg-yellow-500 border-none px-4 py-2 rounded cursor-pointer"
        >
          {t.cta}
        </button>
      </div>
    )
  );
};

export default CookieBar;
