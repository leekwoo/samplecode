import axios from "axios";
import { observable, action } from "mobx";
import { Toast } from "../utils";
import { TVod } from "./LiveListStore";

export const VodStore = observable({
  MyVod: [] as TVod[],
  loading: true,
  config: { headers: { "Custom-Token": "" } },
  wishvodlog: [] as any[],
  relatedVodList: [] as TVod[],

  returnWishVod(vod_id: number) {
    return VodStore.wishvodlog.some((x) => x == vod_id);
  },

  async getMyVod() {
    await axios
      .get(`https://www.byeolshowco.com/user/myvod/`, VodStore.config)
      .then(
        action((response: any) => {
          VodStore.MyVod = response.data.success.my_vod;
          VodStore.wishvodlog = [];
          for (let i = 0; i < response.data.success.my_vod.length; i++) {
            VodStore.wishvodlog.push(VodStore.MyVod[i].vod_id);
          }
        })
      )
      .catch((err) => {
        console.log("찜한 VOD를 불러오지 못했습니다", err);
      });
  },

  async ToggleWishVod(vod_id: number) {
    await axios
      .post("https://www.byeolshowco.com/user/myvod/", { vod_id: String(vod_id) }, VodStore.config)
      .then(
        action(() => {
          if (!VodStore.returnWishVod(vod_id)) {
            VodStore.wishvodlog.unshift(vod_id);
            Toast("별쇼를 찜했습니다");
          } else {
            const index = VodStore.wishvodlog.findIndex((e) => e == vod_id);
            if (index !== -1) VodStore.wishvodlog.splice(index, 1);
            Toast("별쇼를 찜 해제 했습니다");
          }
        })
      )
      .catch((err) => {
        console.log("별쇼 찜하기 실패:", err);
      });
    VodStore.getMyVod();
  },

  async relatedVod(product_id: string) {
    await axios
      .get(`https://www.byeolshowco.com/media/related/?product_id=${product_id}`)
      .then(
        action((response: any) => {
          VodStore.relatedVodList = response.data;
        })
      )
      .catch((err) => {
        console.log("영상목록을 불러오는데 실패했습니다", err);
        Toast("영상을 불러오는데 실패했습니다");
      });
  },

  streamDate(date: string) {
    if (date == null) {
      return "기한 없음";
    } else {
      let s = date;
      return s.slice(5, 7) + "월 " + s.slice(8, 10) + "일" + " ㅣ " + s.slice(11, 16) + " 방송";
    }
  },

  // UserAuth
  login: action((custom_token: string) => {
    VodStore.config = {
      headers: {
        "Custom-Token": custom_token
      }
    };
    VodStore.getMyVod();
  }),
  init: action(() => {
    VodStore.MyVod = [] as TVod[];
    VodStore.wishvodlog = [] as any[];
    VodStore.relatedVodList = [] as TVod[];
    VodStore.loading = true;
    VodStore.config = { headers: { "Custom-Token": "" } };
  })
});
