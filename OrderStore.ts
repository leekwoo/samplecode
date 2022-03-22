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
    if (status == "under-refunded") return this.getOrderStatus() + "개 환불요청 처리중";
    else if (status == "over-refunded") return "초과환불";
    else if (status == "partially-refunded") return this.getOrderStatus() + "개 환불요청 완료";
    else if (status == "refunded") return this.getOrderStatus() + "개 환불요청 완료";
    else if (status == "accepted") return this.getOrderStatus() + "개 환불요청 승인완료";
    else return this.getOrderStatus() + "개 상품 주문취소";
  },

  getPaymentStatus(status: String) {
    if (status == "paid") return "결제완료";
    else if (status == "placed") return "결제대기중";
    else if (status == "under-paid") return "부분결제완료";
    else if (status == "over-paid") return "초과결제";
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
      return "기한 없음";
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
      return "카드결제";
    } else if (payment_method == "trans") {
      return "계좌이체";
    } else if (payment_method == "vbank") {
      return "무통장입금";
    } else if (payment_method == "phone") {
      return "모바일 소액결제";
    } else if (payment_method == "samsung") {
      return "삼성페이";
    } else if (payment_method == "kpay") {
      return "Kpay";
    } else if (payment_method == "kakaopay") {
      return "카카오페이";
    } else if (payment_method == "payco") {
      return "페이코";
    } else if (payment_method == "lpay") {
      return "Lpay";
    } else if (payment_method == "ssgpay") {
      return "SSGpay";
    } else if (payment_method == "tosspay") {
      return "토스";
    } else if (payment_method == "cultureland") {
      return "컬쳐랜드 문화상품권";
    } else if (payment_method == "smartculture") {
      return "스마트문상";
    } else if (payment_method == "happymoney") {
      return "해피머니";
    } else if (payment_method == "booknlife") {
      return "도서문화상품권";
    } else if (payment_method == "point") {
      return "포인트결제";
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
        console.log("주문정보를 가져오지 못했습니다", err);
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
        console.log("주문리스트를 불러오지 못했습니다", err);
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
        console.log("결제정보를 불러오지 못했습니다", err);
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
            "mismatching-vendor-order-resources 여러 입점사의 주문 요소가 포함되었습니다."
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
        Toast("수령완료 처리 되었습니다.");
      })
      .catch((error) => {
        const err_msg = error.response.data;
        console.log(err_msg);
        if (err_msg === "received-order 이미 수령 완료된 주문입니다.") {
          Toast("이미 수령 완료된 주문입니다.");
        } else {
          Toast("오류가 발생하였습니다.");
        }
      });
  }),

  hideOrderHistory: action(async (order_id: string) => {
    await axios
      .delete(`https://www.byeolshowco.com/order/history/${order_id}/`, OrderStore.config)
      .then(async () => {
        await OrderStore.fetchOrderHistory();
        Toast("주문내역이 삭제되었습니다.");
      })
      .catch(() => {
        Toast("오류가 발생하였습니다.");
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
