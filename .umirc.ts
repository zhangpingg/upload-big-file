import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/formSmallFile", component: "formSmallFile" },
    { path: "/test01", component: "test01" },
  ],
  npmClient: 'yarn'
});
