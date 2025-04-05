import { useEffect, useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { load } from "recaptcha-v3";

const ContactForm = () => {
  const [state, handleSubmit] = useForm("mzzdajna");
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    email: '',
    message: '',
  });

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
    if (state.errors) {
      const errorMessage = state.errors.getAllFieldErrors();
      const newErrorMessages = { name: '', email: '', message: '' };

      for (const error of errorMessage) {
        if (error[0] === 'email') {
          if (error[1][0].code === 'TYPE_EMAIL') {
            newErrorMessages.email = 'L\'email doit être valide.';
          } else {
            newErrorMessages.email = 'L\'email est requis.';
          }
        } else if (error[0] === 'message') {
          newErrorMessages.message = 'Le message est requis.';
        }
      }

      setErrorMessages(newErrorMessages);
    }
  }, [state.errors]);

  if (state.succeeded) {
    return <p className="text-green-900 bg-green-200 p-4">Merci ! Votre message a été envoyé avec succès.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="_language" value="fr" />
      <div className="mt-2">
        <label htmlFor="email" className="sr-only">
          * Courriel
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Entrez votre adresse e-mail."
          className="w-full mt-2 p-2 rounded text-inherit"
          required
        />
        {errorMessages.email && (
          <p className="text-sm text-red-900 bg-red-200 p-2 mt-4">{errorMessages.email}</p>
        )}
      </div>

      <div className="mt-2">
        <label htmlFor="message" className="sr-only">
          * Message
        </label>
        <textarea
          id="message"
          name="message"
          className="w-full h-32 mt-2 p-2 rounded text-inherit"
          placeholder="Entrez votre message avec votre nom."
          required
        />
        {errorMessages.message && (
          <p className="text-sm text-red-900 bg-red-200 p-2 mt-2">{errorMessages.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full mt-4 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      >
        {state.submitting ? "Envoi en cours..." : "Envoyer mon message"}
      </button>
    </form>
  );
};

export default ContactForm;
