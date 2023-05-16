import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "home" },
    { path: "/uploadBigFile", component: "uploadBigFile" },
    { path: "/formSmallFile", component: "formSmallFile" },
  ],
  npmClient: 'yarn',
  history: {
    type: 'hash'
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/dist/' : '/'
});
