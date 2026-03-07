/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        royal: '#1E3A8A',
        gold: '#D4AF37',
        crimson: '#7F1D1D',
        parchment: '#F9F1DD',
        steel: '#475569'
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        ebgaramond: ['EB Garamond', 'serif']
      },
      boxShadow: {
        wax: '0 10px 30px rgba(127,29,29,0.5)'
      }
    }
  },
  plugins: []
};
