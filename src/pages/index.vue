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
        <v-flex shrink v-if="deviceNotRegister">
          <v-alert type="error" :value="true">
            This device was not register to your account
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
                      <v-form>
                        <v-text-field
                          autocomplete="new-password"
                          v-model="loginData.username"
                          v-validate="'required'"
                          :error-messages="errors.collect('Username')"
                          name="Username"
                          label="Username"
                          prepend-inner-icon="mdi-account"
                          :disabled="loading"
                          @keypress.enter="submitLogin"
                        ></v-text-field>
                        <v-text-field
                          autocomplete="new-password"
                          v-model="loginData.password"
                          v-validate="'required'"
                          :error-messages="errors.collect('Password')"
                          type="password"
                          name="Password"
                          label="Password"
                          prepend-inner-icon="mdi-textbox-password"
                          :disabled="loading"
                          @keypress.enter="submitLogin"
                        ></v-text-field>
                      </v-form>
                      <v-card-actions>
                        <v-btn block :loading="loading" color="primary" @click="submitLogin">Login</v-btn>
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
                            :loading="loading"
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
      deviceNotRegister: false,
      appLoaded: false
    };
  },
  computed: {
    request() {
      return this.$route.query;
    }
  },
  mounted() {
    chilliController.host = portalConfig.host;
    chilliController.port = portalConfig.port;
    chilliController.interval = portalConfig.interval;
    chilliController.debug = portalConfig.debug;

    chilliController.onError = this.handleErrors;
    chilliController.onUpdate = this.updateUI;

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
            this.loginData = data.login;
            this.submitLogin();
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
      this.request.vouhcer = this.voucher;
      const { data } = await axios.post(
        portalConfig.backendURL + "api/portal/voucher",
        this.request
      );
      if (data.status) {
        this.loginData = {
          username: this.request.mac,
          password: data.login.password
        };
        this.submitLogin();
      }
    },
    async submitLogin() {
      this.loading = true;
      this.deviceNotRegister = false;
      const { username, password } = this.loginData;

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
        this.loading = false;
        this.deviceNotRegister = !data.allow;
        if (!data.allow) {
          return;
        }
      } catch (err) {
        console.log(err);
      }
      chilliController.logon(username, password);
    }
  }
};
</script>
<style >
.v-dialog {
  box-shadow: none !important;
}
</style>