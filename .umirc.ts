import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/test01", component: "test01" },
  ],
  npmClient: 'yarn'
});
