import preset from '@reyogo/config/tailwind.preset';
import type { Config } from 'tailwindcss';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
