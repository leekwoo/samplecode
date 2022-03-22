import React from "react";
import Layout from "../../../constants/Layout";
import MyItemCards from "./MyItemCards";
import Icon from "../../../assets/icons/arrow";
import MyFollowCards from "./MyFollowCards";
import MyTab from "../MyTab";
import BasicInfo from "../BasicInfo";
import CSinfo from "../CSInfo";
import ScheduleCard from "../../../components/ScheduleCard";
import MyShow from "./MyShow";
import { StyleSheet, ScrollView, Platform, TouchableOpacity, RefreshControl } from "react-native";
import { Text, View } from "../../../components/Themed";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { CouponStore } from "../../../stores/CouponStore";
import { InfluencerStore } from "../../../stores/InfluencerStore";
import { WishListStore } from "../../../stores/WishListStore";
import { OrderStore } from "../../../stores/OrderStore";
import { LiveListStore } from "../../../stores/LiveListStore";

const MyShopping = observer(() => {
  //CouponStore.getcoupon();
  //프로필 사진이 없을경우에 프로필을 불러올떄 오류생김
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await InfluencerStore.fetchFollowingInfluencers();
    await WishListStore.getWishedProducts();
    await CouponStore.getcoupon(1, true);
    await OrderStore.fetchOrderHistory();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <MyTab />
        <View style={styles.container}>
          <View style={styles.like}>

            <View style={styles.container_row}>
              <Text style={styles.text_title}>찜한 상품</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("WishList")}
                style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={styles.text_more}>전체보기</Text>
                <Icon name="arrow" />
              </TouchableOpacity>
            </View>
            <MyItemCards />

            <View style={styles.container_row}>
              <Text style={styles.text_title}>팔로우한 셀러</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("FollowingInfluencers")}
                style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={styles.text_more}>전체보기</Text>
                <Icon name="arrow" />
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 40 }}>
              <MyFollowCards />
            </View>

            <View style={styles.container_row}>
              <Text style={styles.text_title}>알림 설정한 별쇼</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("AlarmList")}
                style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={styles.text_more}>전체보기</Text>
                <Icon name="arrow" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              {LiveListStore.alarmList.length > 0 ? (
                LiveListStore.alarmList
                  .slice(0, 3)
                  .map((item, index) => (
                    <ScheduleCard
                      key={index}
                      item={item}
                      divider={Math.min(3, LiveListStore.alarmList.length) > index + 1}
                      onPress={() => navigation.navigate("ItemDetail", { ID: item.product_id })}
                      onPressText={() => navigation.navigate("InfluencerShop", { influencer_id: item.influencer_id })}
                    />
                  ))
              ) : (
                <View style={{ height: 150, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>알림 설정된 항목이 없습니다</Text>
                </View>
              )}
            </View>

            <View style={styles.container_row}>
              <Text style={styles.text_title}>찜한 별쇼</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("WishVodScreen")}
                style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={styles.text_more}>전체보기</Text>
                <Icon name="arrow" />
              </TouchableOpacity>
            </View>
            <View style={{
              borderBottomWidth: 6,
              borderBottomColor: "#f6f6f6"
            }}>
              <MyShow />
            </View>

          </View>
          <BasicInfo />
        </View>
        <CSinfo />
      </ScrollView>
    </View>
  );
});
export default MyShopping;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 20,
    fontWeight: "normal",
    textAlign: "center",
    color: "#252525",
    marginBottom: Platform.OS === "ios" ? 0 : -Layout.window.height * 0.019,
    paddingTop: Platform.OS === "ios" ? 15 : 0
  },
  myinfofont: {
    marginTop: Layout.window.height * 0.00678,
    marginBottom: Platform.OS === "ios" ? Layout.window.height * 0.00678 : Layout.window.height * 0.0135,
    fontSize: 20,
    color: "#252525",
    opacity: 0.8
  },
  like: {
    width: Layout.window.width,
    display: "flex",
    justifyContent: "space-between",
    textAlign: "left",
    flexDirection: "column",
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: Layout.window.width * 0.05,
    marginRight: Layout.window.width * 0.05,
    marginBottom: Layout.window.height * 0.0135,
    marginTop: Layout.window.height * 0.0135
  },
  myinfo: {
    color: "#252525",
    borderBottomColor: "#252525",
    borderBottomWidth: 1.6,
    marginTop: Layout.window.height * 0.049,
    marginVertical: 0,
    width: Layout.window.width * 0.9,
    flexDirection: "column",
    paddingBottom: Platform.OS === "ios" ? Layout.window.height * 0.00678 : -Layout.window.height * 0.0135
  },
  infotitle: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    textAlign: "left",
    color: "#252525",
    marginBottom: Platform.OS === "ios" ? 0 : -Layout.window.height * 0.0095
  },
  subinfotitle: {
    color: "#505050",
    borderBottomColor: "#f2f2f2",
    borderBottomWidth: 1.6,
    marginTop: Layout.window.height * 0.0027,
    paddingVertical: Layout.window.height * 0.011,
    width: Layout.window.width * 0.9,
    flexDirection: "row",
    paddingBottom: Layout.window.height * 0.00678,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "space-between",
    opacity: 1
  },
  subinfolast1: {
    color: "#505050",
    marginTop: Layout.window.height * 0.0027,
    paddingVertical: Layout.window.height * 0.011,
    width: Layout.window.width * 0.9,
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" ? Layout.window.height * 0.00678 : 0,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "space-between"
  },
  subinfolast: {
    color: "#505050",
    marginTop: Layout.window.height * 0.0027,
    paddingVertical: Layout.window.height * 0.011,
    width: Layout.window.width * 0.9,
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" ? Layout.window.height * 0.00678 : Layout.window.height * 0.0678,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "space-between",
    marginBottom: Platform.OS === "ios" ? 0 : 0
  },
  noticetitle: {
    color: "#252525",
    borderBottomColor: "#252525",
    marginTop: Layout.window.height * 0.049,
    width: Layout.window.width * 0.9,
    paddingBottom: Layout.window.height * 0.00678,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "center",
    textAlign: "left"
  },
  noticesub: {
    color: "#505050",
    marginTop: -Layout.window.height * 0.0271,
    width: Layout.window.width * 0.9,
    flexDirection: "row",
    paddingBottom: -Layout.window.height * 0.0203,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 18.5,
    fontWeight: "normal",
    justifyContent: "space-between"
  },
  container_social_button: {
    marginTop: Layout.window.height * 0.00678,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: Layout.window.height * 0.096,
    borderRadius: 4,
    backgroundColor: "#fae300"
  },
  image_social_icon: {
    width: Layout.window.width * 0.105,
    height: Layout.window.width * 0.105,
    resizeMode: "contain",
    marginLeft: Layout.window.width * 0.05,
    backgroundColor: "transparent"
  },
  text_social_button: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Platform.OS === "ios" ? 17 : 20,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 32,
    letterSpacing: 0,
    textAlign: "center",
    color: "#000000"
  },
  myinfo_margin: {
    marginTop: Platform.OS === "ios" ? Layout.window.height * 0.00678 : Layout.window.height * 0.0122,
    marginBottom: Layout.window.height * 0.00678
  },
  container_row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  text_title: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 20,
    color: "#252525"
  },
  text_more: {
    fontFamily: "NotoSansCJKkr-Regular",
    opacity: 0.6,
    marginRight: 5,
    fontSize: 15
  }
});
