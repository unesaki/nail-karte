import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F2A7BB',
          deep: '#D97FA0',
          light: '#FDE8EF',
        },
        bg: '#FFF5F7',
        accent: '#BFA8C9',
        quick: '#F5A623',
        danger: '#E57373',
        success: '#5BC97A',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

export default config
