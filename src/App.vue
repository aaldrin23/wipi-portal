
<template>
  <v-app>
    <v-container grid-list-md justify-center fill-height align-center>
      <v-layout column align-center justify-center>
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
                      <v-text-field
                        v-model="login.username"
                        v-validate="'required'"
                        :error-messages="errors.collect('Username')"
                        name="Username"
                        label="Username"
                        prepend-inner-icon="mdi-account"
                        :disabled="loading"
                      ></v-text-field>
                      <v-text-field
                        v-model="login.username"
                        v-validate="'required'"
                        :error-messages="errors.collect('Password')"
                        type="password"
                        name="Password"
                        label="Password"
                        prepend-inner-icon="mdi-textbox-password"
                        :disabled="loading"
                      ></v-text-field>
                      <v-card-actions>
                        <v-btn x-small text>Forogt password</v-btn>
                        <v-btn :loading="loading" color="primary">Login</v-btn>
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
    </v-container>
    <v-footer absolute>
      <v-icon left>mdi-copyright</v-icon>WiPI-Home 2019-2000
    </v-footer>
  </v-app>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";
export default {
  components: {
    QrcodeStream
  },
  data() {
    return {
      tab: 0,
      login: {},
      voucher: "",
      qrDialog: false,
      loading: false
    };
  },
  methods: {
    onDecode(e) {
      this.qrDialog = false;
      this.voucher = e;
      this.submitVoucher();
    },
    submitVoucher() {
      this.loading = true;
    },
    submitLogin() {
      this.loading = true;
    }
  }
};
</script>