import { observable, action } from "mobx";
import axios from "axios";
import { number } from "prop-types";
import { Toast } from "../utils";

export const OrderStore = observable({
  detailLoading: false,
  loading: false,
  config: { headers: { "Custom-Token": "" } },
  orderHistory: [],
  paymentInfo: {
    pay_method: "",
    card_number: "",
    paid_at: 0
  },
  myReviews: [],
  userinfo: {
    _id: ""
  },
  orderInfo: {
    _id: "",
    total: {
      items: {
        price: {
          withTax: 0,
          sale: 0
        }
      },
      price: {
        withTax: 0,
        sale: 0
      },
      shipping: {
        fee: {
          withTax: 0
        }
      }
    },
    items: [
      {
        product: {
          name: "",
          _id: "",
          thumbnail: {
            url: ""
          }
        },
        quantity: "",
        price: {
          sale: 0
        },
        variant: {
          types: [
            {
              option: {
                _id: "",
                name: ""
              },
              variation: {
                _id: "",
                value: ""
              }
            }
          ]
        }
      }
    ],
    refunds: [
      {
        items: [
          {
            product: {
              name: "",
              _id: "",
              thumbnail: {
                url: ""
              }
            },
            quantity: "",
            price: {
              sale: number,
              withTax: number
            },
            item: {
              variant: {
                types: [
                  {
                    option: {
                      _id: "",
                      name: ""
                    },
                    variation: {
                      _id: "",
                      value: ""
                    }
                  }
                ],
                price: {
                  sale: number
                }
              }
            },
            variant: {
              types: [
                {
                  option: {
                    _id: "",
                    name: ""
                  },
                  variation: {
                    _id: "",
                    value: ""
                  }
                }
              ]
            }
          }
        ],
        total: {
          price: {
            withTax: number,
            sale: number
          },
          shipping: {
            fee: {
              withTax: number
            }
          }
        },
        status: "",
        cancellation: {
          reason: "",
          cancelledAt: ""
        },
        createdAt: ""
      }
    ],
    transactions: [
      {
        paid: 0,
        vbanks: [
          {
            name: "",
            amount: {
              raw: 0
            },
            expiresAt: {
              raw: ""
            },
            number: ""
          }
        ],
        cancelled: ""
      }
    ],
    address: {
      shipping: {
        name: {
          full: ""
        },
        company: null,
        state: "",
        address2: "",
        mobile: "",
        address1: ""
      }
    },
    meta: {
      PCCC: String
    },
    fulfillments: [
      {
        tracking: {
          uid: ""
        }
      }
    ],
    cancellation: {
      reason: "",
      cancelledAt: ""
    },
    customer: {
      email: "",
      mobile: ""
    },
    request: "",
    status: "",
    done: true
  },
  orderId: "",

  getOrderStatus() {
    let n = 0;
    for (let i = 0; i < OrderStore.orderInfo.refunds.length; i++) {
      if (OrderStore.orderInfo.refunds[i].status != "cancelled") n++;
    }
    return n;
  },

  getCancelledStatus(status: String) {
    if (status == "under-refunded") return this.getOrderStatus() + "??? ???????????? ?????????";
    else if (status == "over-refunded") return "????????????";
    else if (status == "partially-refunded") return this.getOrderStatus() + "??? ???????????? ??????";
    else if (status == "refunded") return this.getOrderStatus() + "??? ???????????? ??????";
    else if (status == "accepted") return this.getOrderStatus() + "??? ???????????? ????????????";
    else return this.getOrderStatus() + "??? ?????? ????????????";
  },

  getPaymentStatus(status: String) {
    if (status == "paid") return "????????????";
    else if (status == "placed") return "???????????????";
    else if (status == "under-paid") return "??????????????????";
    else if (status == "over-paid") return "????????????";
  },

  getCouponSale() {
    let sum = 0;
    for (let i = 0; i < OrderStore.orderInfo.refunds.length; i++) {
      for (let j = 0; j < OrderStore.orderInfo.refunds[i].items.length; j++) {
        if (OrderStore.orderInfo.refunds[i].status == "accepted") {
          sum +=
            Number(OrderStore.orderInfo.refunds[i].items[j].item.variant.price.sale) *
              Number(OrderStore.orderInfo.refunds[i].items[j].quantity) -
            Number(OrderStore.orderInfo.refunds[i].items[j].price.withTax);
        }
      }
    }
    return sum;
  },

  setOrderId(id: string) {
    OrderStore.orderId = id;
  },

  paidDate(date: string) {
    if (date == null) {
      return "?????? ??????";
    } else {
      let s = date;
      return s.slice(0, 4) + "." + s.slice(5, 7) + "." + s.slice(8, 10) + " 23:59";
    }
  },

  returnRefundcost() {
    let sum = 0;
    for (let i = 0; i < OrderStore.orderInfo.refunds.length; i++) {
      if (OrderStore.orderInfo.refunds[i].status == "accepted") {
        sum += Number(OrderStore.orderInfo.refunds[i].total.price.withTax);
      }
    }
    return sum;
  },

  returnShippingcost() {
    let sum = 0;
    for (let i = 0; i < OrderStore.orderInfo.refunds.length; i++) {
      if (OrderStore.orderInfo.refunds[i].status == "accepted") {
        sum += Number(OrderStore.orderInfo.refunds[i].total.shipping.fee.withTax);
      }
    }
    return sum;
  },

  returnOriginalcost() {
    let sum = 0;
    for (let i = 0; i < OrderStore.orderInfo.refunds.length; i++) {
      for (let j = 0; j < OrderStore.orderInfo.refunds[i].items.length; j++) {
        if (OrderStore.orderInfo.refunds[i].status == "accepted") {
          sum +=
            Number(OrderStore.orderInfo.refunds[i].items[j].item.variant.price.sale) *
            Number(OrderStore.orderInfo.refunds[i].items[j].quantity);
        }
      }
    }
    return sum;
  },

  returnPaymentInfo(payment_method: string) {
    if (payment_method == "card") {
      return "????????????";
    } else if (payment_method == "trans") {
      return "????????????";
    } else if (payment_method == "vbank") {
      return "???????????????";
    } else if (payment_method == "phone") {
      return "????????? ????????????";
    } else if (payment_method == "samsung") {
      return "????????????";
    } else if (payment_method == "kpay") {
      return "Kpay";
    } else if (payment_method == "kakaopay") {
      return "???????????????";
    } else if (payment_method == "payco") {
      return "?????????";
    } else if (payment_method == "lpay") {
      return "Lpay";
    } else if (payment_method == "ssgpay") {
      return "SSGpay";
    } else if (payment_method == "tosspay") {
      return "??????";
    } else if (payment_method == "cultureland") {
      return "???????????? ???????????????";
    } else if (payment_method == "smartculture") {
      return "???????????????";
    } else if (payment_method == "happymoney") {
      return "????????????";
    } else if (payment_method == "booknlife") {
      return "?????????????????????";
    } else if (payment_method == "point") {
      return "???????????????";
    } else {
      return payment_method;
    }
  },

  returnPaidtime(paid_at: number) {
    let dtime = new Date(paid_at * 1000);
    let year = String(dtime.getFullYear());
    let month = "00" + String(dtime.getMonth() + 1);
    let date = "00" + String(dtime.getDate());
    let hour = "00" + String(dtime.getHours());
    let minute = "00" + String(dtime.getMinutes());
    let second = "00" + String(dtime.getSeconds());

    return `${year}.${month.slice(-2)}.${date.slice(-2)} ${hour.slice(-2)}:${minute.slice(
      -2
    )}:${second.slice(-2)}`;
  },

  fetchOrderInfo: action(async (order_id: string) => {
    await axios
      .get(`https://www.byeolshowco.com/order/${order_id}`, OrderStore.config)
      .then(
        action((response: any) => {
          OrderStore.orderInfo = response.data;
          OrderStore.detailLoading = false;
        })
      )
      .catch((err) => {
        console.log("??????????????? ???????????? ???????????????", err);
      });
  }),

  setLoading: action((bool: boolean) => {
    OrderStore.loading = bool;
  }),

  setdetailLoading: action((bool: boolean) => {
    OrderStore.detailLoading = bool;
  }),

  fetchOrderHistory: action(async (page: number = 1) => {
    await axios
      .get(`https://www.byeolshowco.com/order/?page=${page}`, OrderStore.config)
      .then(
        action((response: any) => {
          if (page === 1) {
            OrderStore.orderHistory = response.data;
          } else {
            OrderStore.orderHistory = OrderStore.orderHistory.concat(response.data);
          }
        })
      )
      .catch((err) => {
        console.log("?????????????????? ???????????? ???????????????", err);
      });
  }),

  fetchMyReviews: action(async (page: number = 1) => {
    await axios
      .get(
        `https://www.byeolshowco.com/review/list/customer/${OrderStore.userinfo._id}/?page=${page}`
      )
      .then(
        action((response: any) => {
          if (page === 1) {
            OrderStore.myReviews = response.data;
          } else {
            OrderStore.myReviews = OrderStore.myReviews.concat(response.data);
          }
        })
      );
  }),

  fetchPaymentInfo: action(async (order_id: string) => {
    await axios
      .get(`https://www.byeolshowco.com/payment/pay_info/?order_id=${order_id}`)
      .then(
        action((response: any) => {
          OrderStore.paymentInfo = response.data;
        })
      )
      .catch((err) => {
        console.log("??????????????? ???????????? ???????????????", err);
      });
  }),

  requestRefund: action(async (order_id: string, reason: string, items: any, shipments: any) => {
    let data = {
      payload: {
        reason: reason,
        items: items,
        shipments: shipments
      }
    };
    let errorMsg = "";

    await axios
      .post(`https://www.byeolshowco.com/refund/${order_id}/`, data, OrderStore.config)
      .then(
        (response) => {
          console.log(response.data);
        },
        (error) => {
          console.log(error.response.data);
          if (
            error.response.data ===
            "mismatching-vendor-order-resources ?????? ???????????? ?????? ????????? ?????????????????????."
          ) {
            errorMsg = "mismatchingVendor";
          }
        }
      )
      .catch((error) => {
        console.log(error.response.data);
      });
    return errorMsg;
  }),
  updateReceivedMark: action(async (order_id: string) => {
    await axios
      .post(`https://www.byeolshowco.com/order/${order_id}/receivemark/`, {}, OrderStore.config)
      .then(async () => {
        await OrderStore.fetchOrderHistory();
        Toast("???????????? ?????? ???????????????.");
      })
      .catch((error) => {
        const err_msg = error.response.data;
        console.log(err_msg);
        if (err_msg === "received-order ?????? ?????? ????????? ???????????????.") {
          Toast("?????? ?????? ????????? ???????????????.");
        } else {
          Toast("????????? ?????????????????????.");
        }
      });
  }),

  hideOrderHistory: action(async (order_id: string) => {
    await axios
      .delete(`https://www.byeolshowco.com/order/history/${order_id}/`, OrderStore.config)
      .then(async () => {
        await OrderStore.fetchOrderHistory();
        Toast("??????????????? ?????????????????????.");
      })
      .catch(() => {
        Toast("????????? ?????????????????????.");
      });
  }),

  login: action((custom_token: string, _id: string) => {
    OrderStore.config = {
      headers: {
        "Custom-Token": custom_token
      }
    };
    OrderStore.userinfo._id = _id;
    OrderStore.fetchOrderHistory();
  }),
  init: action(() => {
    OrderStore.config = {
      headers: {
        "Custom-Token": ""
      }
    };
    OrderStore.userinfo._id = "";
    OrderStore.orderHistory = [];
    OrderStore.paymentInfo = {
      pay_method: "",
      card_number: "",
      paid_at: 0
    };
    OrderStore.loading = false;
  })
});
