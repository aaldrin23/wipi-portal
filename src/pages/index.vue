<template>
  <v-container grid-list-md justify-center fill-height align-center>
    <div v-if="appLoaded">
      <v-layout v-if="!isAuthenticated" column align-center justify-center>
        <v-flex shrink>
          <v-layout row wrap justify-center class="display-1">Welcome to</v-layout>
          <div class="layout justify-center py-2 align-center">
            <div class="d-flex align-baseline">
              <h2>wi</h2>
              <span class="display-2">Pi</span>
              <v-icon size="50" color="primary">mdi-home-outline</v-icon>
              <span class="display-2">ome</span>
              <v-icon>mdi-wifi mdi-rotate-45</v-icon>
            </div>
          </div>
        </v-flex>
        <v-flex shrink style="width : 100%">
          <v-alert type="error" v-model="showAlert">
            {{replyMessage}}
            <template v-slot:close="{toggle}">
              <v-icon class="ml-2" @click="toggle">mdi-close-circle</v-icon>
            </template>
          </v-alert>
        </v-flex>
        <v-flex shrink>
          <v-card min-width="300">
            <v-tabs dark v-model="tab" background-color="primary" slider-color="white">
              <v-tab>Login</v-tab>
              <v-tab>Enter Voucher</v-tab>
            </v-tabs>
            <v-card-text>
              <v-layout column>
                <v-flex>
                  <v-tabs-items v-model="tab">
                    <v-tab-item>
                      <v-form data-vv-scope="login">
                        <v-text-field
                          autocomplete="new-password"
                          v-model="loginData.username"
                          v-validate="'required'"
                          :error-messages="errors.collect('login.Username')"
                          name="Username"
                          label="Username"
                          prepend-inner-icon="mdi-account"
                          :disabled="loading"
                          @keypress.enter="submitLogin(null)"
                        ></v-text-field>
                        <v-text-field
                          autocomplete="new-password"
                          v-model="loginData.password"
                          v-validate="'required'"
                          :error-messages="errors.collect('login.Password')"
                          type="password"
                          name="Password"
                          label="Password"
                          prepend-inner-icon="mdi-textbox-password"
                          :disabled="loading"
                          @keypress.enter="submitLogin(null)"
                        ></v-text-field>
                      </v-form>
                      <v-card-actions>
                        <v-btn block color="primary" @click="submitLogin(null)">Login</v-btn>
                      </v-card-actions>
                    </v-tab-item>
                    <v-tab-item>
                      <v-layout column justify-center>
                        <v-text-field
                          v-model="voucher"
                          name="Voucher"
                          label="Voucher"
                          prepend-inner-icon="mdi-ticket-percent"
                          :disabled="loading"
                        ></v-text-field>
                        <v-card-actions>
                          <v-btn
                            :disabled="!voucher"
                            block
                            color="primary"
                            @click="submitVoucher"
                          >Continue</v-btn>
                        </v-card-actions>
                        <v-dialog
                          v-model="qrDialog"
                          max-width="500px"
                          transition="dialog-transition"
                        >
                          <template v-slot:activator="{on}">
                            <v-btn text v-on="on">
                              <v-icon left>mdi-qrcode-scan</v-icon>Scan code
                            </v-btn>
                          </template>
                          <v-card>
                            <v-card-text>
                              <qrcode-stream @decode="onDecode"></qrcode-stream>
                            </v-card-text>
                          </v-card>
                        </v-dialog>
                      </v-layout>
                    </v-tab-item>
                  </v-tabs-items>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      <v-dialog
        v-model="isAuthenticated"
        persistent
        hide-overlay
        max-width="500px"
        transition="dialog-transition"
        class="elevation-0"
      >
        <v-card elevation="0">
          <v-card-text>
            <v-layout column justify-center>
              <v-flex class="text-center">
                <v-icon size="100" color="success">mdi-check-circle-outline</v-icon>
              </v-flex>
              <v-flex class="text-center title py-2">
                You are now connected to
                <div class="layout justify-center py-2 align-center">
                  <div class="d-flex align-baseline">
                    wi
                    <span class="display-1">Pi</span>
                    <v-icon large color="primary">mdi-home-outline</v-icon>
                    <span class="display-1">ome</span>
                    <v-icon>mdi-wifi mdi-rotate-45</v-icon>
                  </div>
                </div>
              </v-flex>
              <v-flex class="text-center">
                <v-btn dark color="red" href="http://logout">Disconnect</v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
    <v-layout v-else row align-center justify-center>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-layout>
    <v-dialog v-model="loading" persistent max-width="300px" transition="dialog-transition">
      <v-card>
        <v-card-text>
          <v-layout column justify-center align-center>
            <v-flex shrink>
              <v-progress-circular indeterminate></v-progress-circular>
            </v-flex>
            <v-flex shrink>{{loadingMessage}}</v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
import { QrcodeStream } from "vue-qrcode-reader";
import axios from "axios";

const reqSchema = {
  res: "",
  uamip: "",
  uamport: "",
  challenge: "",
  called: "",
  mac: "",
  ip: "",
  ssid: "",
  nasid: "",
  sessionid: "",
  userurl: ""
};
export default {
  components: {
    QrcodeStream
  },
  data() {
    return {
      tab: 0,
      loginData: {},
      voucher: "",
      qrDialog: false,
      loading: false,
      isAuthenticated: false,
      appLoaded: false,
      showAlert: false,
      loggingOn: false,
      replyMessage: "",
      loadingMessage: ""
    };
  },
  computed: {
    request() {
      return this.$route.query;
    }
  },
  mounted() {
    let vm = this;
    chilliController.host = portalConfig.host;
    chilliController.port = portalConfig.port;
    chilliController.interval = portalConfig.interval;
    chilliController.debug = portalConfig.debug;

    chilliController.onError = this.handleErrors;
    chilliController.onUpdate = this.updateUI;

    chilliController.onReply = function(raw) {
      if (chilliController.clientState != 2) {
        vm.loading = false;
        if (vm.loggingOn) {
          vm.replyMessage = "Login failed!";
          vm.loggingOn = false;
          vm.showAlert = true;
        }
      }
      if (raw.message) {
        vm.replyMessage = raw.message;
        vm.showAlert = true;
      }
    };
    chilliController.refresh();
  },
  methods: {
    handleErrors(code) {
      console.log(code);
    },
    async updateUI() {
      this.isAuthenticated = chilliController.clientState;
      if (!this.isAuthenticated) {
        try {
          const { data } = await axios.get(
            portalConfig.backendURL + "api/portal/auto-connect",
            {
              params: {
                mac_address: this.request.mac
              }
            }
          );
          if (data.connect) {
            this.submitLogin(data.login);
          }
        } catch (err) {
          console.log(err);
        }
      }
      this.appLoaded = true;
      this.loading = false;
    },
    onDecode(e) {
      this.qrDialog = false;
      this.voucher = e;
      this.submitVoucher();
    },
    async submitVoucher() {
      this.loading = true;
      this.loadingMessage = "Validating voucher...";
      this.request.voucher = this.voucher;
      const { data } = await axios.post(
        portalConfig.backendURL + "api/portal/voucher",
        this.request
      );
      if (data.status) {
        const username = this.request.mac + "_" + this.voucher;
        this.submitLogin({
          username,
          password: data.login.password
        });
      } else {
        this.replyMessage = data.message;
        this.showAlert = true;
      }
    },
    async submitLogin(data) {
      let valid = true;
      if (!data) {
        // using login form
        valid = await this.$validator.validateAll("login");
        this.loadingMessage = "Logging you in...";
        this.loggingOn = true;
      }
      if (valid) {
        this.loading = true;
        this.showAlert = false;

        const { username, password } = data || this.loginData;

        try {
          const { data } = await axios.get(
            portalConfig.backendURL + "api/portal/device-access",
            {
              params: {
                username,
                mac_address: this.request.mac
              }
            }
          );
          if (!data.allow) {
            this.replyMessage = "This device was not register to your account";
            this.showAlert = true;
            return;
          }
        } catch (err) {
          console.log(err);
        }
        chilliController.logon(username, password);
      }
    }
  },
  watch: {
    isAuthenticated(val, from) {
      if (!val && from) {
        this.replyMessage = "Connection ended!";
        this.showAlert = true;
      }
    }
  }
};
</script>
<style >
.v-dialog {
  box-shadow: none !important;
}
</style>