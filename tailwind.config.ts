import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Hiragino Sans GB"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        serif: [
          '"Songti SC"',
          '"SimSun"',
          '"Noto Serif SC"',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
