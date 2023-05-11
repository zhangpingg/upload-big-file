import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "uploadBigFile" },
    { path: "/formSmallFile", component: "formSmallFile" },
  ],
  npmClient: 'yarn'
});
