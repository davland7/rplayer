/** @type {import('tailwindcss').Config} */
export const content = ["index.html"];
export const theme = {
  extend: {},
};
export const plugins = [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
];
