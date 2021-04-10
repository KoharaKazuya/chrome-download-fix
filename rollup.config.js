import resolve from "rollup-plugin-node-resolve";

export default {
  input: ["src/background.js", "src/options.js"],
  output: { dir: "dist" },
  plugins: [resolve()],
};
