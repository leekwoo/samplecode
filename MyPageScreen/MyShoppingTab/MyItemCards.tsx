import React, { useState, useEffect } from "react";
import { TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import { View, Text } from "../../../components/Themed";
import Layout from "../../../constants/Layout";
import { useNavigation } from "@react-navigation/native";
import { WishListStore } from "../../../stores/WishListStore";
import _ from "lodash";

const MyItemCards = observer(() => {
  const navigation = useNavigation();
  const [state] = useState(WishListStore);
  useEffect(() => {
    if (state.loading) {
      //state.getWishedProducts();
      state.setLoading(false);
    }
  }, [state.loading]);
  return (
    <View>
      {!_.isEmpty(state.products) ? (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.slider}>
          <View style={{ flexDirection: "row", paddingRight: 10 }}>
            {state.products.map((product, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.card_item}
                  onPress={() => navigation.navigate("ItemDetail", { ID: product._id })}
                >
                  <Image source={{ uri: product.thumbnail.url }} style={styles.card_item} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noitem}>
          <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>찜한 상품이 없습니다</Text>
        </View>
      )}
    </View>
  );
});
export default MyItemCards;

const styles = StyleSheet.create({
  card_item: {
    width: 130,
    height: 130,
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginRight: 15
  },
  details: {
    fontSize: 15,
    fontWeight: "normal",
    height: 20,
    marginRight: 15,
    padding: 15
  },
  slider: {
    width: Layout.window.width,
    height: 190
  },
  noitem: {
    justifyContent: "center",
    alignItems: "center",
    height: 150
  }
});
