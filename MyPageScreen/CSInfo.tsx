import React from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Text, View } from "../../components/Themed";
import Layout from "../../constants/Layout";

const CSinfo = () => {
  return (
    <View style={{ backgroundColor: "#f6f6f6", alignItems: "center", paddingVertical: 30 }}>
      <View style={{ backgroundColor: "#f6f6f6", width: Layout.window.width * 0.9 }}>
        <Text style={styles.noticetitle}>별쇼 고객센터</Text>
        <Text style={styles.noticesub}>
          영업시간 오전 10시 ~ 오후 18시에 순차적으로 답변을 드리고 있으니 잠시만 기다려주시면 빠르게 처리해드리겠습니다.
        </Text>
        <TouchableOpacity
          onPress={() => {
            // 문의
            Linking.openURL("http://pf.kakao.com/_DjgUK/chat").catch((err) => {
              alert("앱 실행에 실패했습니다.");
            });
          }}
          activeOpacity={0.8}
          style={styles.container_social_button}
        >
          <Image style={styles.image_social_icon} source={require("../../assets/images/icon_kakao.png")} />
          <Text style={styles.text_social_button}>카카오톡으로 문의하기</Text>
          <View style={styles.image_social_icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CSinfo;

const styles = StyleSheet.create({
  noticetitle: {
    color: "#252525",
    borderBottomColor: "#252525",
    width: Layout.window.width * 0.9,
    paddingBottom: 10,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 21.5,
    fontWeight: "normal",
    justifyContent: "center",
    textAlign: "left",
    lineHeight: 26
  },
  noticesub: {
    color: "#505050",
    //marginTop: -Layout.window.height * 0.0271,
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
  }
});
