import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { View, Text } from "../../../components/Themed";
import Layout from "../../../constants/Layout";
import { observer } from "mobx-react-lite";
import GradientShowCardHorizontal from "../../../components/GradientShowCardHorizontal";
import { InfluencerStore, TInfluencers } from "../../../stores/InfluencerStore";
import { useNavigation } from "@react-navigation/native";
import _ from "lodash";

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

const MyFollowCards = observer(() => {
  const [state] = useState(InfluencerStore);
  const navigation = useNavigation();

  return (
    <View>
      {!_.isEmpty(state.FollowingInfluencers) ? (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ width: Layout.window.width }}>
          <View style={styles.container_scrollView}>
            {state.FollowingInfluencers.slice(0, 3).map((item: TInfluencers, index) => (
              <GradientShowCardHorizontal
                key={index}
                title={item.alias}
                imageURL={item.avatar}
                onPress={() => {
                  navigation.navigate("InfluencerShop", { influencer_id: item._id });
                }}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noitem}>
          <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>팔로우한 셀러가 없습니다</Text>
        </View>
      )}
    </View>
  );
});

export default MyFollowCards;

const styles = StyleSheet.create({
  container_scrollView: {
    flexDirection: "row",
    paddingHorizontal: 8
  },
  image_card: {
    width: 80,
    height: 80,
    borderRadius: 100
  },
  container_seller: {
    paddingTop: Layout.window.height * 0.0271,
    paddingRight: Layout.window.width * 0.0305
  },
  text_seller: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 15,
    color: "#131313",
    opacity: 0.8,
    width: Layout.window.width * 0.241,
    textAlign: "center"
  },
  image_border: {
    height: 95,
    width: 95,
    justifyContent: "center",
    alignItems: "center"
  },
  noitem: {
    justifyContent: "center",
    alignItems: "center",
    width: Layout.window.width,
    height: 150
  }
});
