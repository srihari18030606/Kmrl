// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,jsx}"],
//   theme: {
//     extend: {
//       fontFamily: {
//         mono: ["'Share Tech Mono'", "monospace"],
//         display: ["'Barlow Condensed'", "sans-serif"],
//         body: ["'Barlow'", "sans-serif"],
//       },
//       colors: {
//         depot: {
//           bg:      "#070a0e",
//           panel:   "#0d1117",
//           card:    "#111820",
//           border:  "#1c2535",
//           dim:     "#243044",
//           accent:  "#00c2ff",
//           green:   "#00e676",
//           yellow:  "#ffd740",
//           red:     "#ff1744",
//           orange:  "#ff6d00",
//           text:    "#cdd9e5",
//           muted:   "#64748b",
//           white:   "#f0f6fc",
//         },
//       },
//       fontSize: {
//         "2xs": "0.65rem",
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["'Share Tech Mono'", "monospace"],
        display: ["'Barlow Condensed'", "sans-serif"],
        body:    ["'Barlow'", "sans-serif"],
      },
      colors: {
        depot: {
          bg:     'var(--depot-bg)',
          panel:  'var(--depot-panel)',
          card:   'var(--depot-card)',
          border: 'var(--depot-border)',
          dim:    'var(--depot-dim)',
          accent: 'var(--depot-accent)',
          green:  'var(--depot-green)',
          yellow: 'var(--depot-yellow)',
          red:    'var(--depot-red)',
          orange: 'var(--depot-orange)',
          text:   'var(--depot-text)',
          muted:  'var(--depot-muted)',
          white:  'var(--depot-white)',
        },
      },
      fontSize: {
        "2xs": "0.65rem",
      },
    },
  },
  plugins: [],
}