import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, FlatList } from "react-native";
import Layout from "../../constants/Layout";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import { observer } from "mobx-react-lite";
import Loading from "../../components/Loading";
import { Text, View } from "../../components/Themed";
import { WishListStore } from "../../stores/WishListStore";
import RenderGrid from "../../components/RenderGrid";
import { toJS } from "mobx";
import _ from "lodash";
import useHandleScroll from "../../hooks/useHandleScroll";
import UpperButton from "../../components/UpperButton";

/*const TabNavigator = observer(({ WishList }: { WishList: any }) => {
  return (
    <TabStack.Navigator>
      <TabStack.Screen
        name={WishList.name}
        options={{ headerShown: false }}
      >
        {() => <ItemList WishList={WishList} />}
      </TabStack.Screen>
    </TabStack.Navigator>
  );
})*/

const WishItem = observer(() => {
  const [refreshing, setRefreshing] = useState(false);
  const [state] = useState(WishListStore);
  const { handleScroll, showUpperButton } = useHandleScroll();
  const FlatlistRef = useRef<FlatList<any>>();

  // const [page, setPage] = useState(
  //   _.isEmpty(state.products)
  //     ? 1
  //     : Math.ceil(state.products.length / 120) + 1
  // );

  const fetchProducts = async () => {
    // setPage(
    //   _.isEmpty(state.products)
    //     ? 1
    //     : Math.ceil(state.products.length / 120) + 1
    // );
    // await state.getWishedProducts(page, force).then(() => {
    //   state.setLoading(false);
    // });

    await state.getWishedProducts().then(() => {
      state.setLoading(false);
    });
    // setPage(
    //   _.isEmpty(state.products)
    //     ? 1
    //     : Math.ceil(state.products.length / 120) + 1
    // );
  };

  let endReachCall: any;

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // state.getWishedProducts(page, true)
    state.getWishedProducts().then(() => {
      setRefreshing(false);
    });
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton headerTitle={"찜한 상품"} />
      {state.products ? (
        state.products.length > 0 ? (
          <FlatList
            ref={FlatlistRef}
            data={toJS(state.products)}
            style={{ width: Layout.window.width }}
            keyExtractor={(item) => String(item._id) + "H"}
            renderItem={({ item }) => <RenderGrid item={item} />}
            numColumns={2}
            windowSize={2}
            showsVerticalScrollIndicator={false}
            bounces={true}
            refreshing={refreshing}
            onRefresh={onRefresh}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onEndReached={() => {
              if (!endReachCall) {
                endReachCall = setTimeout(() => {
                  fetchProducts();
                  endReachCall = false;
                }, 1000);
              }
            }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "transparent"
            }}
          >
            <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>찜한 상품이 없습니다</Text>
          </View>
        )
      ) : (
        <Loading overlay={true} />
      )}
      {showUpperButton && <UpperButton FlatlistRef={FlatlistRef} top={Layout.window.height - Layout.statusBarHeight - 60} />}
    </View>
  );
});

export default WishItem;

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
    justifyContent: "center",
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
  heartIcon: {
    justifyContent: "center",
    margin: 30
  },
  text_summary: {
    fontSize: 13,
    color: "gray"
  },
  itemno: {
    justifyContent: "center",
    alignItems: "center",
    width: Layout.window.width,
    height: Layout.window.height,
    flex: 1
  }
});
