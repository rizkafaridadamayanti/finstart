import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { installGlobalFormValidation } from "./utils/formValidation.js";

installGlobalFormValidation();
createApp(App).mount("#app");
