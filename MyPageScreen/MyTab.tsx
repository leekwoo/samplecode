import React, { useEffect } from "react";
import Layout from "../../constants/Layout";
import _ from "lodash";
import { StyleSheet, Platform, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View } from "../../components/Themed";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { UserAuthStore } from "../../stores/UserAuthStore";
import { CouponStore } from "../../stores/CouponStore";
import ProfileImage from "../SettingScreen/Profile";
import { OrderStore } from "../../stores/OrderStore";

const MyTab = observer(() => {
  useEffect(() => {
    ProfileImage;
  }, []);
  //프로필 사진이 없을경우에 프로필을 불러올떄 오류생김
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: "column" }}>
        <View style={styles.mytab}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={{ flexDirection: "row" }}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            {_.isNull(UserAuthStore.userInfo.avatar) || UserAuthStore.userInfo.avatar.url === "" ? (
              <Image source={require("../../assets/images/default_profile.png")} style={styles.Pimg} />
            ) : (
              <Image source={{ uri: UserAuthStore.userInfo.avatar.url }} style={styles.Pimg} />
            )}
            <View>
              <Text style={styles.mytabtitle}>{UserAuthStore.userInfo.alias + " 님"}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ paddingLeft: Layout.window.width * 0.165 }}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={{
                marginLeft: 0,
                marginVertical: Layout.window.height * 0.00678 //의미가 있는건지 잘 모르겠슴
              }}
              onPress={() => {
                navigation.navigate("SettingScreen");
              }}
            >
              <View style={styles.option}>
                <Text style={{ textAlign: "center", fontFamily: "NotoSansCJKkr-Regular", lineHeight: 20 }}>설정</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            width: Layout.window.width,
            height: Layout.window.height * 0.14,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            borderBottomWidth: 6,
            borderBottomColor: "#f6f6f6"
          }}
        >
          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              borderRightWidth: 0.5,
              //height: Layout.window.height * 0.14,
              borderRightColor: "#e2e2e2",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              width: Layout.window.width * 0.5
            }}
            onPress={() => {
              navigation.navigate("OrderHistoryScreen");
            }}
          >
            <Text
              style={{
                color: "#252525",
                fontSize: 18,
                opacity: 0.6,
                fontFamily: "NotoSansCJKkr-Bold",
                lineHeight: 25
              }}
            >
              주문 및 배송
            </Text>
            <Text style={styles.number}>{OrderStore.orderHistory.length > 99 ? "99+" : OrderStore.orderHistory.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              borderLeftWidth: 0.5,
              //height: Layout.window.height * 0.14,
              borderLeftColor: "#e2e2e2",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              width: Layout.window.width * 0.5
            }}
            onPress={() => navigation.navigate("CouponListScreen")}
          >
            <Text
              style={{
                color: "#252525",
                fontSize: 18,
                opacity: 0.6,
                fontFamily: "NotoSansCJKkr-Bold",
                lineHeight: 25
              }}
            >
              보유쿠폰
            </Text>
            <Text style={styles.number}>{CouponStore.count > 99 ? "99+" : CouponStore.count}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
export default MyTab;

const styles = StyleSheet.create({
  Pimg: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "gray",
    marginLeft: Layout.window.width * 0.0127,
    marginTop: Layout.window.height * 0.00678
  },
  mytab: {
    width: Layout.window.width,
    fontSize: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    flexDirection: "row",
    paddingVertical: Layout.window.height * 0.025,
    paddingHorizontal: Layout.window.width * 0.0611
    //paddingTop: Platform.OS === "ios" ? 24 : 0,
    //paddingBottom: Layout.window.height * 0.0271,
    //marginBottom: -Layout.window.height * 0.0271
  },
  option: {
    fontSize: 14,
    borderRadius: 15,
    color: "#252525",
    borderColor: "#252525",
    borderWidth: 1,
    width: 45,
    padding: Platform.OS === "ios" ? 4 : 2,
    textAlign: "center"
  },
  number: {
    fontFamily: "NotoSansCJKkr-Bold",
    fontSize: 30,
    opacity: 0.8,
    paddingTop: 20,
    lineHeight: 32
  },
  mytabtitle: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 20,
    fontWeight: "normal",
    textAlign: "left",
    color: "#252525",
    paddingTop: Layout.window.height * 0.025,
    paddingLeft: Layout.window.width * 0.0254,
    lineHeight: 23
  }
});
