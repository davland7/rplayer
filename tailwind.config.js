/** @type {import('tailwindcss').Config} */
/*
npx tailwindcss -i ./src/index.css -o ./index.css --watch
npx tailwindcss -o index.css --minify
*/
export const content = ["index.html"];
export const theme = {
  extend: {},
};
export const plugins = [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
];
