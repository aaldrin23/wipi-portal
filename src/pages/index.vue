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

const reqSchema = {
  res: "notyet",
  uamip: "192.168.10.1",
  uamport: "3990",
  challenge: "79b3c881090a2b26532f25a083e7d962",
  called: "B8-27-EB-33-17-3D",
  mac: "34-41-5D-D9-E3-06",
  ip: "192.168.10.4",
  ssid: "Arabis-GOWIFI",
  nasid: "KUPIKI",
  sessionid: "156441000700000001",
  userurl: "http://google.com/"
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
      appLoaded: false
    };
  },
  computed: {
    request() {
      return this.$route.query;
    }
  },
  mounted() {
    chilliController.host = "192.168.10.1";
    chilliController.port = 3990;
    chilliController.interval = 20;

    chilliController.debug = true;
    chilliController.onError = this.handleErrors;
    chilliController.onUpdate = this.updateUI;

    chilliController.refresh();
  },
  methods: {
    handleErrors(code) {},
    updateUI() {
      this.isAuthenticated = chilliController.clientState;
      this.appLoaded = true;
    },
    onDecode(e) {
      this.qrDialog = false;
      this.voucher = e;
      this.submitVoucher();
    },
    async submitVoucher() {
      this.loading = true;
      this.request.vouhcer = this.voucher;
      const { data } = await axios.post("/portal/voucher", this.request);
      console.log(data);
    },
    submitLogin() {
      this.loading = true;
      const { username, password } = this.loginData;

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