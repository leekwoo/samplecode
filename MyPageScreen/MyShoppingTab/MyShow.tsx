import * as React from "react";
import { StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { observer } from "mobx-react-lite";
import { View, Text } from "../../../components/Themed";
import WishCardHorizontal from "../../../components/WishCardHorizontal";
import { VodStore } from "../../../stores/VodStore";
import Layout from "../../../constants/Layout";
import _ from "lodash";
import Loading from "../../../components/Loading";


export type LiveShow = {
  _id: string;
  img: string;
  view: number;
  reserve: number;
  live: boolean;
  startTime: string;
  product: {
    name: string;
    brand: string;
    price: number;
    discount: number;
  };
};

const MyShow = observer(() => {
  const navigation = useNavigation();
  const [state] = React.useState(VodStore);

  /*React.useEffect(() => {
    if (state.loading) state.getMyVod();
  }, []);*/

  return (
    state.MyVod !== undefined ? (
      !_.isEmpty(state.MyVod) ? (
        <View style={styles.container}>
          {state.MyVod.slice(0, 3).map((item, index) => (
            <WishCardHorizontal
              key={index}
              title={item.title}
              description={item.product_name}
              live={item.status === "live"}
              imageURL={item.product_thumbnail}
              toggleAction={async () => {
                await state.ToggleWishVod(item.vod_id);
              }}
              divider={index + 1 < state.MyVod.slice(0, 3).length}
              isToggled={state.returnWishVod(item.vod_id)}
              onPress={() => {
                if (item.status === "close") {
                  Alert.alert(
                    "아직 처리 중인 VOD입니다",
                    "처리 완료 후에 다시 보실 수 있습니다"
                  )
                } else if (item.status === "completed") {
                  if (item.mux_asset_playback_id === null) {
                    Alert.alert(
                      "재생할 수 없는 영상입니다"
                    )
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
          <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>
            찜한 별쇼가 없습니다
          </Text>
        </View>
      )
    ) : (
      <View style={{ flex: 1 }}>
        <Loading overlay={true} />
      </View>
    )
  );
});

export default MyShow;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  replayno: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    width: Layout.window.width
  },
});
