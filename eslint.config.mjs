// ES Lint flat config — deliberately minimal. The verify chain runs
// `npm run lint:unreachable` to guarantee no dead/unreachable code can
// regress in server-side modules. Only `no-unreachable` is enabled; this
// is not a general style lint.
export default [
  {
    files: ["js/**/*.js", "lib/**/*.js", "middleware/**/*.js", "server.js", "server-test.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "script" },
    rules: { "no-unreachable": "error" },
  },
  {
    files: ["eslint.config.mjs", "test/run-all.mjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: { "no-unreachable": "error" },
  },
];