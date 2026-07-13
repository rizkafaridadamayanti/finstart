import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { installGlobalFormValidation } from "./utils/formValidation.js";
import { installRupiahInputs } from "./utils/rupiahInputs.js";

installGlobalFormValidation();
installRupiahInputs();
createApp(App).mount("#app");
