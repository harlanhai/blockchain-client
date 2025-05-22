module.exports = {
  plugins: [
    'postcss-import',
    "@tailwindcss/postcss",
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
      },
    ],
  ],
};
// module.exports = {
//   plugins: {
//     'tailwindcss': {},
//     'autoprefixer': {},
//   },
// }