import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/demo_01", component: "demo_01" },
    { path: "/test01", component: "test01" },
  ],
  npmClient: 'yarn'
});
