import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import Layout from "../../../constants/Layout";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { observer } from "mobx-react-lite";
import Loading from "../../../components/Loading";
import { Text, View } from "../../../components/Themed";
import { VodStore } from "../../../stores/VodStore";
import WishCardHorizontal from "../../../components/WishCardHorizontal";
import _ from "lodash";

const WishVod = observer(() => {
  const navigation = useNavigation();
  const [state] = useState(VodStore);

  useEffect(() => {
    if (state.loading) {
      VodStore.getMyVod();
    }
  }, []);

  return (
    <View style={styles.container}>
      <HeaderWithBackButton headerTitle={"찜한 별쇼"} />
      <ScrollView>
        <View style={{ paddingHorizontal: 20, backgroundColor: "transparent" }}>
          {state.MyVod !== undefined ? (
            !_.isEmpty(state.MyVod) ? (
              <View style={{ flex: 1, backgroundColor: "transparent"  }}>
                {state.MyVod.map((item, index) => (
                  <WishCardHorizontal
                    key={index}
                    title={item.title}
                    description={item.product_name}
                    live={item.status === "live"}
                    imageURL={item.product_thumbnail}
                    toggleAction={async () => {
                      await VodStore.ToggleWishVod(item.vod_id);
                      state.getMyVod();
                    }}
                    divider={index + 1 < state.MyVod.length}
                    isToggled={state.returnWishVod(item.vod_id)}
                    onPress={() => {
                      if (item.status === "close") {
                        Alert.alert("아직 처리 중인 VOD입니다", "처리 완료 후에 다시 보실 수 있습니다");
                      } else if (item.status === "completed") {
                        if (item.mux_asset_playback_id === null) {
                          Alert.alert("재생할 수 없는 영상입니다");
                        } else {
                          navigation.navigate("VODScreen", { vod_id: item.vod_id });
                        }
                      } else if (item.status === "live") {
                        navigation.navigate("LiveScreen", { vod_id: item.vod_id });
                      }
                    }}
                    page="vod"
                  />
                ))}
              </View>
            ) : (
              <View style={styles.replayno}>
                <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>찜한 별쇼가 없습니다</Text>
              </View>
            )
          ) : (
            <View style={{ flex: 1 }}>
              <Loading overlay={true} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

export default WishVod;

const styles = StyleSheet.create({
  container_product: {
    flexDirection: "row",
    width: Layout.window.width
  },
  container_text: {
    justifyContent: "center",
    width: Layout.window.width - 225
  },
  container_icon: {
    justifyContent: "center",
    alignItems: "flex-end"
  },
  container_flatlist: {
    width: Layout.window.width
  },
  container: {
    backgroundColor: "#ffffff",
    flex: 1
  },
  card: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10
  },
  title: {
    fontWeight: "bold",
    fontSize: 16
  },
  discount: {
    textDecorationLine: "line-through",
    color: "gray",
    fontSize: 15
  },
  price: {
    fontWeight: "bold",
    fontSize: 16
  },
  text_summary: {
    fontSize: 13,
    color: "gray"
  },
  replayno: {
    justifyContent: "center",
    alignItems: "center",
    height: Layout.window.height * 0.8,
    backgroundColor: "transparent"
  }
});
