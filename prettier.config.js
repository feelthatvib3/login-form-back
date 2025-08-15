export default {
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 100,
  trailingComma: "none",
  importOrder: ["^modules/(.*)$", "^config/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
