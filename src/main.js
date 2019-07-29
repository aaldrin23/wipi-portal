import Vue from 'vue';
import App from './App.vue';
import VeeValidate from 'vee-validate';

import vuetify from './plugins/vuetify';
import router from './router';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false;

Vue.use(VeeValidate);

new Vue({
	vuetify,
	router,
	render: h => h(App)
}).$mount('#app');
