import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "../../assets/icons/arrow";
import { Text, View } from "../../components/Themed";
import Layout from "../../constants/Layout";

const BasicInfo = () => {
  const navigation = useNavigation();

  return (
    <View>
      <View style={styles.myinfo}>
        <Text style={styles.infotitle}>나의 쇼핑정보</Text>
      </View>
      <TouchableOpacity activeOpacity={0.6} style={styles.subinfotitle} onPress={() => navigation.navigate("OrderHistoryScreen")}>
        <Text style={styles.myinfofont}>주문/배송 조회</Text>
        <Icon name="arrowBold" />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.subinfotitle}
        onPress={() => navigation.navigate("AddressManageScreen")}
      >
        <Text style={styles.myinfofont}>배송지 관리</Text>
        <Icon name="arrowBold" />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.6} style={styles.subinfolast1} onPress={() => navigation.navigate("MyReviewListScreen")}>
        <Text style={styles.myinfofont}>나의 상품후기</Text>
        <Icon name="arrowBold" />
      </TouchableOpacity>
      <View style={styles.myinfo}>
        <Text style={styles.infotitle}>서비스 안내</Text>
      </View>
      <TouchableOpacity activeOpacity={0.6} style={styles.subinfolast} onPress={() => navigation.navigate("PolicyScreen")}>
        <Text style={styles.myinfofont}>약관 및 정책</Text>
        <Icon name="arrowBold" />
      </TouchableOpacity>
    </View>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  myinfo: {
    color: "#252525",
    borderBottomColor: "#252525",
    borderBottomWidth: 1.6,
    marginTop: Layout.window.height * 0.025,
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
    alignItems: "center",
    opacity: 1
  },
  subinfolast1: {
    color: "#505050",
    marginTop: Layout.window.height * 0.0027,
    paddingVertical: Layout.window.height * 0.011,
    width: Layout.window.width * 0.9,
    flexDirection: "row",
    paddingBottom: Layout.window.height * 0.00678,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "space-between",
    alignItems: "center"
  },
  subinfolast: {
    color: "#505050",
    marginTop: Layout.window.height * 0.0027,
    paddingVertical: Layout.window.height * 0.011,
    width: Layout.window.width * 0.9,
    flexDirection: "row",
    paddingBottom: Layout.window.height * 0.0678,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "space-between",
    alignItems: "center"
  },
  myinfofont: {
    marginTop: Layout.window.height * 0.00678,
    marginBottom: Platform.OS === "ios" ? Layout.window.height * 0.00678 : Layout.window.height * 0.0135,
    fontSize: 20,
    color: "#252525",
    fontFamily: "NotoSansCJKkr-Regular",
    fontWeight: "normal",
    lineHeight: 27,
    opacity: 0.8
  }
});
