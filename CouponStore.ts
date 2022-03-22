import axios from "axios";
import { observable, action } from "mobx";
import { Toast } from "../utils";
import { TCheckoutItem } from "./CheckoutStore";

export const CouponStore = observable({
  mycoupons: [] as any[],
  number: 0,
  loading: true,
  eventloading: true,
  couponidlog: [] as string[],
  eventcoupon: [] as any[],
  count: 0,
  config: { headers: { "Custom-Token": "" } },
  userId: "",
  getlogin: false,

  /*issuedCoupon(boolean) {
    this.Issued=boolean
    return this.Issued
  },*/
  expiredate(dateString: string) {
    if (dateString == null) {
      return "기한 없음";
    } else {
      let date = new Date(dateString);
      return "~" + date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate();
    }
  },
  expiredateforevent(dateString: string) {
    if (dateString == null) {
      return "기한 없음";
    } else {
      let date = new Date(dateString);
      return "~" + date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate() + "까지";
    }
  },
  ///Couponscreen///(보유)
  async getcoupon(page: number = 1, force: boolean) {
    let config = CouponStore.config;
    if (force) {
      await axios
        .get(`https://www.byeolshowco.com/coupon/?page=${page}`, config)
        .then(
          action((response: any) => {
            if (page > 1) {
              CouponStore.mycoupons = CouponStore.mycoupons.concat(response.data);
            } else {
              CouponStore.mycoupons = response.data;
            }
            let couponidlog = [];
            CouponStore.loading = false;
            for (response.data of CouponStore.mycoupons) {
              couponidlog.push(response.data._id);
            }
            CouponStore.loading = false;
            CouponStore.couponidlog = couponidlog;
            CouponStore.count = couponidlog.length;
          })
        )
        .catch((err) => {
          console.log("보유쿠폰목록을 불러오는데 실패했습니다", err);
          Toast("보유쿠폰목록을 불러오는데 실패했습니다");
        });
    } else {
      return 0;
    }
  },
  //////(이벤트쿠폰)
  async geteventcoupon(page: number = 1, force: boolean) {
    let config = CouponStore.config;
    if (force && this.eventloading) {
      this.getlogin
        ? await axios
            .get(`https://www.byeolshowco.com/coupon/manager/?page=${page}`, config)
            .then(
              action((response: any) => {
                if (page > 1) {
                  CouponStore.eventcoupon = CouponStore.eventcoupon.concat(response.data);
                } else {
                  CouponStore.eventcoupon = response.data;
                }
                console.log("이벤트 쿠폰 목록을 불러옴");
                this.eventloading = false;
              })
            )
            .catch((err) => {
              console.log("이벤트쿠폰목록을 불러오는데 실패했습니다", err);
            })
        : await axios
            .get(`https://www.byeolshowco.com/coupon/manager/`)
            .then(
              action((response: any) => {
                CouponStore.eventcoupon = response.data;
                console.log("이벤트 쿠폰 목록을 불러옴");
                this.eventloading = false;
              })
            )
            .catch((err) => {
              console.log("이벤트쿠폰목록을 불러오는데 실패했습니다", err);
            });
    }
  },
  ///////
  async addCoupon(C_id: string) {
    let config = CouponStore.config;

    await axios
      .post("https://www.byeolshowco.com/coupon/add/", { payload: { coupon: C_id } }, config)
      .then(
        action(() => {
          //console.log("push"+CouponStore.wishidlog)
          CouponStore.getcoupon(1, true);
          Toast("쿠폰이 발급 되었습니다.");
          CouponStore.loading = true;
          CouponStore.eventloading = true;
          //console.log(ProductDetailStore.wish)
        })
      )
      .catch((err) => {
        console.log("중복발급", err);
        Toast("이미 발급된 쿠폰 입니다.");
      });
  },
  async deleteCoupon(C_id: string) {
    let customtoken = CouponStore.config.headers["Custom-Token"];
    await axios
      .delete("https://www.byeolshowco.com/coupon/", {
        headers: { "Custom-Token": customtoken },
        data: { coupon_ids: [C_id] }
      })
      .then(
        action(() => {
          CouponStore.eventloading = true;
          CouponStore.loading = true;
          //console.log(ProductDetailStore.wish)
        })
      )
      .catch((err) => {
        console.log("선택된쿠폰이 이미 삭제되었습니다.", err);
        Toast("이미 사용된 쿠폰입니다.");
      });
  },
  setLoading: action((loading: boolean) => (CouponStore.loading = loading)),
  setEventLoading: action((eventloading: boolean) => (CouponStore.eventloading = eventloading)),
  checkProductCoupon: action((product: TCheckoutItem) => {
    //상품 쿠폰 확인!
    //상품 쿠폰인 것들만 filter
    if (product.quantity > 1) {
      //1개 이상 구매하는 경우, 쿠폰 사용 불가(클레이풀 방식)
      return [];
    }
    let PossibleCoupons = CouponStore.mycoupons.filter((coupon) => coupon.type === "product");
    //적용 범주에 맞는 쿠폰만 filter
    PossibleCoupons = PossibleCoupons.filter(
      (coupon) =>
        coupon.category.type === "any" ||
        (coupon.category.type === "include" &&
          coupon.category.collections !== undefined &&
          coupon.category.collections.find((collection: any) => collection._id === product.category_id)) ||
        (coupon.category.type === "include" &&
          coupon.category.products !== undefined &&
          coupon.category.products.find((item: any) => item._id === product._id))
    );
    if (product.isDiscounted === true) {
      //만약 할인이 들어간 상품이라면, 중복할인허용 쿠폰만 filter
      PossibleCoupons = PossibleCoupons.filter((coupon) => coupon.only === false);
    }
    //구매 허들 금액에 맞는 쿠폰만 filter
    PossibleCoupons = PossibleCoupons.filter((coupon) => {
      if (
        coupon.discount.type === "percentage" &&
        ((coupon.price.min !== null && coupon.price.min.raw > 0) || coupon.price.max !== null)
      ) {
        if (coupon.price.min.raw > 0) {
          return product.price_by_quantity >= coupon.price.min.raw ? true : false;
        }
        if (coupon.price.max !== null) {
          return product.price_by_quantity <= coupon.price.max.raw ? true : false;
        } else {
          return coupon.price.min.raw <= product.price_by_quantity && product.price_by_quantity <= coupon.price.max.raw
            ? true
            : false;
        }
      } else {
        return true;
      }
    });
    return PossibleCoupons;
  }),
  checkCartCoupon: action((isDiscounted: boolean, total_price: number) => {
    //총액 쿠폰 확인!
    //NOTE: 상품 쿠폰과 중복적용 가능한지 여부는 이 단계에서는 체크 X -> SelectCoupon에서 확인하도록 함.

    //총액 쿠폰인 것들만 filter
    let PossibleCoupons = CouponStore.mycoupons.filter((coupon) => coupon.type === "cart");
    if (isDiscounted === true) {
      //만약 할인이 들어간 상품이 포함되어있다면, 중복할인허용 쿠폰만 filter
      PossibleCoupons = PossibleCoupons.filter((coupon) => coupon.only === false);
    }
    //구매 허들 금액에 맞는 쿠폰만 filter
    PossibleCoupons = PossibleCoupons.filter((coupon) => {
      if (
        coupon.discount.type === "percentage" &&
        ((coupon.price.min !== null && coupon.price.min.raw > 0) || coupon.price.max !== null)
      ) {
        if (coupon.price.min.raw > 0) {
          return total_price >= coupon.price.min.raw ? true : false;
        }
        if (coupon.price.max !== null) {
          return total_price <= coupon.price.max.raw ? true : false;
        } else {
          return coupon.price.min.raw <= total_price && total_price <= coupon.price.max.raw ? true : false;
        }
      } else {
        return true;
      }
    });
    return PossibleCoupons;
  }),
  login: action((custom_token: string, _id: string) => {
    CouponStore.config = {
      headers: {
        "Custom-Token": custom_token
      }
    };
    CouponStore.userId = _id;
    CouponStore.getcoupon(1, true);
    CouponStore.getlogin = true;
  }),

  init: action(() => {
    (CouponStore.mycoupons.length = 0),
      (CouponStore.number = 0),
      (CouponStore.loading = true),
      (CouponStore.couponidlog.length = 0),
      (CouponStore.eventcoupon.length = 0),
      (CouponStore.count = 0),
      (CouponStore.userId = ""),
      (CouponStore.loading = true),
      (CouponStore.eventloading = true);
    CouponStore.config = { headers: { "Custom-Token": "" } };
    CouponStore.getlogin = false;
  })
});
