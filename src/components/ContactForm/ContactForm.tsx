// Make sure to run npm install @formspree/react
/** biome-ignore-all lint/nursery/useUniqueElementIds: Required by @formspree/react for accessibility and error association. The ids are static and unique within the form. */
// For more help visit https://formspr.ee/react-help
import { useForm, ValidationError } from "@formspree/react";
import { useEffect } from "react";
import { PUBLIC_FORMSPREE_FORM_ID, PUBLIC_RECAPTCHA_SITE_KEY } from "astro:env/client";
import { load } from "recaptcha-v3";

const ContactForm = () => {
	const [state, handleSubmit] = useForm(PUBLIC_FORMSPREE_FORM_ID);

	useEffect(() => {
		const executeRecaptcha = async () => {
			const recaptcha = await load(PUBLIC_RECAPTCHA_SITE_KEY);
			const token = await recaptcha.execute("submit");
			const recaptchaInput = document.createElement("input");
			recaptchaInput.type = "hidden";
			recaptchaInput.name = "g-recaptcha-response";
			recaptchaInput.value = token;
			document.querySelector("form")?.appendChild(recaptchaInput);
		};
		executeRecaptcha();
	}, []);

	if (state.succeeded) {
		return (
			<p>
				Thanks for taking the time to write to us! Your feedback is invaluable in helping us improve{" "}
				<span className="font-semibold">
					R<span className="text-primary">Player</span>
				</span>
				.
			</p>
		);
	}
	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
			<label htmlFor="email">Email Address</label>
			<input
				className="w-full px-4 py-2 bg-white border-2 border-gray-500 rounded text-black transition-colors hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
				id="email"
				type="email"
				name="email"
			/>
			<ValidationError
				className="text-red-500"
				prefix="Email"
				field="email"
				errors={state.errors}
			/>
			<textarea
				className="w-full px-4 py-2 bg-white border-2 border-gray-500 rounded text-black transition-colors hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
				id="message"
				name="message"
			/>
			<ValidationError
				className="text-red-500"
				prefix="Message"
				field="message"
				errors={state.errors}
			/>
			<button
				className="px-4 py-2 border-2 rounded font-bold transition-colors cursor-pointer border-primary-500 text-primary-400 hover:bg-primary-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 w-fit"
				type="submit"
				disabled={state.submitting}
			>
				Submit
			</button>
		</form>
	);
};

export default ContactForm;
