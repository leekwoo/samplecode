import axios from "axios";
import { observable, action } from "mobx";
import { Toast } from "../utils";
// import { UserAuthStore } from "./UserAuthStore";

export const WishListStore = observable({
  products: [] as any[],
  number: 0,
  wishidlog: [] as string[], //좋아요한 상품들의 아이디만 따로 저장
  loading: true,
  config: { headers: { "Custom-Token": "" } },

  returnWish(id: string) {
    return WishListStore.wishidlog.some((x) => x == id);
  },
  // async getWishedProducts(page: number = 1,force: boolean = true) {
  //   await axios
  //     .get(`https://www.byeolshowco.com/wishlist/?page=${page}`, WishListStore.config)
  //     .then(
  //       action((response: any) => {
  //         if (page > 1) {
  //           WishListStore.products = WishListStore.products.concat(response.data);
  //         }
  //         else{
  //           WishListStore.products = response.data;
  //         }
  //         let wishidlog = [];
  //         WishListStore.loading = false;
  //         for (response.data of WishListStore.products) {
  //           wishidlog.push(response.data._id);
  //         }
  //         WishListStore.loading = false;
  //         WishListStore.wishidlog = wishidlog;
  //       })
  //     )
  //     .catch((err) => {
  //       console.log("찜목록을 불러오는데 실패했습니다", err);
  //     });
  // },

  async getWishedProducts() {
    await axios
      .get(`https://www.byeolshowco.com/wishlist/`, WishListStore.config)
      .then(
        action((response: any) => {
          WishListStore.products = response.data;
          let wishidlog = [];
          for (let i = 0; i < WishListStore.products.length; i++) {
            wishidlog.push(WishListStore.products[i]._id);
          }
          WishListStore.wishidlog = wishidlog;
          WishListStore.loading = false;
        })
      )
      .catch((err) => {
        console.log("찜목록을 불러오는데 실패했습니다", err);
      });
  },

  async ToggleWish(product_id: string) {
    if (!WishListStore.returnWish(product_id)) {
      await axios
        .post("https://www.byeolshowco.com/wishlist/", { product: product_id }, WishListStore.config)
        .then(
          action(() => {
            WishListStore.wishidlog.unshift(product_id);
            Toast("상품을 찜목록에 추가했습니다.");
            WishListStore.loading = true;
          })
        )
        .catch((err) => {
          console.log("일시적인 오류로 찜 목록 추가가 되지 않았습니다.", err);
          Toast("일시적인 오류로 찜 목록 추가가 되지 않았습니다.");
        });
    } else {
      await axios
        .delete("https://www.byeolshowco.com/wishlist/", {
          headers: WishListStore.config.headers,
          data: { product: product_id }
        })
        .then(
          action(() => {
            //console.log("pop" + WishListStore.wishidlog)
            Toast("상품을 찜목록에서 삭제했습니다.");
            const index = WishListStore.wishidlog.findIndex((e) => e == product_id);
            if (index !== -1) WishListStore.wishidlog.splice(index, 1);
          })
        )
        .catch((err) => {
          console.log("일시적인 오류로 찜 목록에서 삭제가 되지 않았습니다.", err);
          Toast("일시적인 오류로 찜 목록에서 삭제가 되지 않았습니다.");
        });
    }
    WishListStore.getWishedProducts();
  },
  setLoading: action((loading: boolean) => (WishListStore.loading = loading)),

  // UserAuth
  login: action((custom_token: string) => {
    WishListStore.config = {
      headers: {
        "Custom-Token": custom_token
      }
    };
    WishListStore.getWishedProducts();
  }),
  init: action(() => {
    WishListStore.products.length = 0;
    WishListStore.number = 0;
    WishListStore.wishidlog.length = 0; //좋아요한 상품들의 아이디만 따로 저장
    WishListStore.loading = true;
    WishListStore.config = { headers: { "Custom-Token": "" } };
  })
});
