import { useEffect, useState, useRef } from "react";
import { useForm } from "@formspree/react";
import { load } from "recaptcha-v3";
import messages from './messages.json' with { type: "json" };

const baseInputClasses =
  "w-full px-4 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 shadow-inner transition-all text-xs";

const ContactForm = () => {
  const [state, handleSubmit] = useForm("mzzdajna");
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    message: '',
  });
  const [focus, setFocus] = useState({
    email: false,
    message: false,
  });
  const [success, setSuccess] = useState(false);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    const executeRecaptcha = async () => {
      const recaptcha = await load("6LdtNQIrAAAAAJfT4whJXAhzuzKwDpFS7RZbpwuw");
      const token = await recaptcha.execute("submit");
      const recaptchaInput = document.createElement("input");
      recaptchaInput.type = "hidden";
      recaptchaInput.name = "g-recaptcha-response";
      recaptchaInput.value = token;
      document.querySelector("form")?.appendChild(recaptchaInput);
    };
    executeRecaptcha();
  }, []);

  useEffect(() => {
    if (state.succeeded) {
      setSuccess(true);
    }
    if (state.errors) {
      const errorMessage = state.errors.getAllFieldErrors();
      const newErrorMessages = { email: '', message: '' };
      for (const error of errorMessage) {
        if (error[0] === 'email') {
          if (error[1][0].code === 'TYPE_EMAIL') {
            newErrorMessages.email = messages.emailInvalid;
          } else {
            newErrorMessages.email = messages.emailRequired;
          }
        } else if (error[0] === 'message') {
          newErrorMessages.message = "Le message est requis.";
        }
      }
      setErrorMessages(newErrorMessages);
    }
  }, [state.errors, state.succeeded]);

  // Détermine la couleur de bordure/ring selon l'état du champ
  function getInputClasses(field: 'email' | 'message') {
    let classes = baseInputClasses;
    if (field === 'message') classes += ' font-mono';
    if (errorMessages[field]) {
      classes += ' border-red-500 ring-2 ring-red-400';
    } else if (success && field === 'email') {
      classes += ' border-green-500 ring-2 ring-green-400';
    } else if (focus[field]) {
      classes += ' border-blue-500 ring-2 ring-blue-400';
    } else {
      classes += ' ring-2 ring-gray-600';
    }
    return classes;
  }

  if (success) {
    return (
      <p className="text-green-400 bg-gray-900 border-2 border-green-500 p-4 rounded text-center">
        {messages.success}
      </p>
    );
  }

  // Affichage d'un message unique (avertissement ou erreur)
  let infoText = messages.warning;
  let infoColor = "text-yellow-300 border-yellow-500";
  if (errorMessages.email) {
    infoText = errorMessages.email;
    infoColor = 'text-red-400 border-red-500';
  } else if (errorMessages.message) {
    infoText = errorMessages.message;
    infoColor = 'text-orange-300 border-orange-500';
  }

  return (
    <>
      <p className={infoColor + " mb-8 p-4 bg-gray-900 border-2 rounded text-center font-semibold"}>
        {infoText}
      </p>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 w-full max-w-xs">
        <input type="hidden" name="_language" value="fr" />
        {/* Champ email classique */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-gray-300 text-sm font-semibold">
            {messages.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder={messages.emailPlaceholder}
            className={getInputClasses('email')}
            required
            ref={emailRef}
            onFocus={() => setFocus(f => ({ ...f, email: true }))}
            onBlur={() => setFocus(f => ({ ...f, email: false }))}
          />
        </div>
        {/* Champ message classique */}
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-gray-300 text-sm font-semibold">
            {messages.messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            placeholder={messages.messagePlaceholder}
            className={getInputClasses('message')}
            required
            ref={messageRef}
            onFocus={() => setFocus(f => ({ ...f, message: true }))}
            onBlur={() => setFocus(f => ({ ...f, message: false }))}
          />
        </div>
        <button
          type="submit"
          disabled={state.submitting}
          className="border-2 border-primary hover:bg-yellow-500 hover:text-black text-primary font-bold px-4 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state.submitting ? messages.sending : messages.submit}
        </button>
      </form>
    </>
  );
};

export default ContactForm;
