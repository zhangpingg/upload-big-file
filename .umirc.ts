import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/formSmallFile", component: "formSmallFile" },
  ],
  npmClient: 'yarn'
});
