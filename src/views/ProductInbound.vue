<template>
    <div>
        <p class="grey--text text--darken-1">Product Inbounds</p> 
        <v-card>
            <v-card-title>
                <v-btn class="primary" @click="action({ action: 'add' })">
                    <v-icon>mdi-plus</v-icon>
                    Create Product Inbound
                </v-btn>
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :loading="loading"
                    :headers="headers"
                    :items="getInbounds.data"
                    :server-items-length="getInbounds.total"
                    :options.sync="pagination"
                    :footer-props="{ 'items-per-page-options': [5, 10, 15, 25, 50, 100]}"
                    class="elevation-1"
                >
                <template v-slot:item.created_at="{ item }">
                    {{moment(item.created_at).format('llll')}}
                </template>
                <template v-slot:item.unit_quantity="{ item }">
                <v-chip small>
                    {{item.unit_quantity}} {{item.unit}}
                </v-chip>
                </template>
                <template v-slot:item.category="{ item }">
                <v-chip small>
                    {{item.category.title}}
                </v-chip>
                </template>
                <template v-slot:item.cost_price="{ item }">
                    {{numberWithCommas(item.cost_price)}}
                </template>
                <template v-slot:item.wholesale_price="{ item }">
                    {{numberWithCommas(item.wholesale_price)}}
                </template>
                <template v-slot:item.retail_price="{ item }">
                    {{numberWithCommas(item.retail_price)}}
                </template>
                <template v-slot:item.action="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon color="primary" class="mr-2" v-on="on" @click="action({ action: 'view-product', data: item })">mdi-eye</v-icon>
                        </template>
                        <span>View Details</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon color="success" class="mr-2" v-on="on" @click="confirmAction({ action: 'edit', data: item })">mdi-pencil</v-icon>
                        </template>
                        <span>Edit</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon color="error" class="mr-2" v-on="on" @click="confirmAction({ action: 'delete', data: item })">mdi-delete</v-icon>
                        </template>
                        <span>Delete</span>
                    </v-tooltip>
                </template>
                </v-data-table>
            </v-card-text>
        </v-card>
        <FormModal @reloadAPI="getDataFromApi()" v-bind="userFormDialog" @close="userFormDialog = { ...userFormDialog, show: false, data: {} }"/>
        <v-dialog v-model="confirmDialog.show" scrollable max-width="540" color="primary" transition="scroll-y-reverse-transition" persistent>
                <v-card>
                    <v-card-title>
                        {{verifyQuantity()? 'Confirmation' : 'Invalid Acion'}} 
                        <v-spacer></v-spacer>
                        <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon class="dialog-close" v-on="on" @click="confirmDialog.show = false">mdi-close</v-icon>
                        </template>
                        <span>Close</span>
                    </v-tooltip>
                    </v-card-title>
                    <v-card-text class="d-flex flex-column align-center justify-center px-9 py-4">
                        <p v-if="!verifyQuantity()" class="headline text-center py-4">Action connot be completed because the product quantity is less than the inbound quantity.</p>
                        <p v-else class="headline text-center py-4">{{ `${(confirmDialog.action == 'edit') ? 'Are you sure you want to edit' : 'Are you sure you want to delete'}` }} {{ `${(confirmDialog.data) ? `${confirmDialog.data.description}?` : 'this product?'}` }}</p>
                    </v-card-text>
                    <v-card-actions v-if="verifyQuantity()" class="pa-5">
                        <v-row align="center" justify="center">
                            <v-col cols="12" class="d-flex justify-center pb-0">
                                <v-btn class="confirm-btn btn-min-width" depressed large dark :color="((confirmDialog.action == 'edit') ? '#2F80ED' : '#EB5757')" @click="action({ action: confirmDialog.action, data: confirmDialog.data });">{{ `${(confirmDialog.action == 'edit') ? 'Confirm' : 'Delete'}` }}</v-btn>

                                <v-btn class="btn-min-width" text large @click="confirmDialog.show = false">Cancel</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <ViewInformation v-bind="formProduct" @close="formProduct = { ...formProduct, show: false, data: {} }" />
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import _ from "lodash";
import moment from 'moment';
import FormModal from '../components/store-admin/product-inbound/FormModal'
import ViewInformation from '../components/store-admin/product-inbound/ViewInformation'
export default {
  components: { FormModal, ViewInformation },
    data () {
      return {
        moment: moment,
        loading: false,
        search: '',
        dialog: false,
        viewInfo: false,
        product: {},
        pagination: {},
        userFormDialog: { show: false, action: '', data: {} },
        confirmDialog : { show: false, action: '', data: {} },
        formProduct: { show: false, action: '', data: {} },
        headers: [
          { text: 'Item Code', value: 'item_code' },
          { text: 'Description', value: 'description' },
          //{ text: 'Category', value: 'category', sortable: false },
          //{ text: 'Unit Quantity', value: 'unit_quantity' },
          { text: 'Quantity', value: 'quantity' },
          { text: 'Cost Price', value: 'cost_price' },
          { text: 'Wholesale Price', value: 'wholesale_price' },
          { text: 'Retail Price', value: 'retail_price' },
          { text: 'Created At', value: 'created_at' },
          { text: 'Action', value: 'action' },
        ],
        first: true
      }
    },
    // mounted() {
    //   this.getDataFromApi();
    // },
    watch: {
      pagination: {
        handler () {
          this.getDataFromApi()
        },
        deep: true
      },
      search: _.debounce(
        function() {
            this.getDataFromApi();
        },
        800,
        {
            leading: true,
            trailing: true
        }
      ),
    },
    methods: {
        verifyQuantity() {
            return this.confirmDialog.data.quantity <= this.confirmDialog.data.remaining_quantity;
        },
        viewProduct(item) {
            this.product = item;
            this.viewInfo = true;
        },
      getDataFromApi() {
        this.loading = true
          if (this.first) {
            this.pagination.sortBy[0]='created_at'
            this.pagination.sortDesc[0]=true
          }

          this.first = false
          let params = {
            search: this.search,
            page: this.pagination.page,
            per_page: this.pagination.itemsPerPage,
            sort_by: this.pagination.sortBy[0],
            sort_order: this.pagination.sortDesc[0]? 'DESC' : 'ASC',
          }
        this.$store.dispatch('getInbounds', params)
          .then(res => {
              this.loading = false
            console.log(res)
          })
          .catch(error => {
              this.loading = false
            console.log(error)
          })
      },
      confirmAction({ action, data }) {
        this.confirmDialog = { show: true, action, data };
        },
      action({ action, data }) {
            // console.log(action, data);
            switch (action) {
                case 'add':
                    this.userFormDialog = { show: true, action, data: {} };
                    break;
                case 'edit':
                    this.confirmDialog.show = false;
                    this.userFormDialog = { show: true, action, data }
                    break;
                case 'delete':
                    this.confirmDialog.show = false;
                    this.deleteUser();
                    break;
                case 'view-product':
                    this.formProduct = { show: true, action, data };
                    break;
            }
        },
        deleteUser() {
            console.log(this.confirmDialog)
            this.loading = true
            this.$store.dispatch('deleteInbound', this.confirmDialog.data.id)
                .then(res => {
                    this.loading = false
                    console.log(res)
                    this.snackbar('success', 'Product Inbound Successfully Deleted');
                })
                .catch(error => {
                    this.loading = false
                    console.log(error)
                    this.snackbar('error', 'Something went wrong');
                })
        },
        snackbar(color, text) {
          this.$store.commit('SET_SNACKBAR', { 
              open: true, 
              color: color, 
              text: text,
              timeout: 4000
          });
        },
    },
    computed: {
        ...mapGetters({
        getInbounds: 'getInbounds'
        })
    },
}
</script>