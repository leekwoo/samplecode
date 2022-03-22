import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, FlatList } from "react-native";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import Loading from "../../components/Loading";
import { View, Text } from "../../components/Themed";
import { CouponStore } from "../../stores/CouponStore";
import CouponList from "../../components/CouponList";
import { observer } from "mobx-react";
import _ from "lodash";
import { toJS } from "mobx";
import Layout from "../../constants/Layout";

const CouponListScreen = observer(() => {
  const [state] = useState(CouponStore);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    state.setLoading(true);
    await state.getcoupon(1, true).then(() => {
      setRefreshing(false);
    });
  };
  const [page, setPage] = useState(_.isEmpty(state.mycoupons) ? 1 : Math.ceil(state.mycoupons.length / 120) + 1);
  const fetchCoupons = async (force: boolean) => {
    setPage(_.isEmpty(state.mycoupons) ? 1 : Math.ceil(state.mycoupons.length / 120) + 1);
    await state.getcoupon(page, force).then(() => {
      //setLoading(false);
    });
    setPage(_.isEmpty(state.mycoupons) ? 1 : Math.ceil(state.mycoupons.length / 120) + 1);
  };

  const FlatlistRef = useRef<FlatList<any>>();
  let endReachCall: any;

  useEffect(() => {
    fetchCoupons(false);
    if (state.loading) {
      state.getcoupon(page, false);
      state.setLoading(false);
    }
  }, []);
  return (
    <View style={styles.container}>
      <HeaderWithBackButton headerTitle={"보유 쿠폰"} showIcon={false} />
      {state.loading ? <Loading overlay={true} /> : <></>}
      {state.mycoupons.length > 0 ? (
        <FlatList
          ListFooterComponent={() => <View style={{ width: Layout.window.width, height: 60 }} />}
          ref={FlatlistRef}
          data={toJS(state.mycoupons)}
          style={{ width: Layout.window.width }}
          keyExtractor={(item) => String(item._id) + "H"}
          renderItem={({ item }) => <CouponList coupon={item} />}
          numColumns={1}
          windowSize={2}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEventThrottle={16}
          onEndReached={() => {
            if (!endReachCall) {
              endReachCall = setTimeout(() => {
                fetchCoupons(true);
                endReachCall = false;
              }, 1000);
            }
          }}
        />
      ) : (
        <View style={styles.itemno}>
          <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>보유 쿠폰이 없습니다</Text>
        </View>
      )}
    </View>
  );
});

export default CouponListScreen;

const styles = StyleSheet.create({
  container: {
    color: "#fdfdfd",
    flex: 1
  },
  itemno: {
    justifyContent: "center",
    alignItems: "center",
    width: Layout.window.width,
    height: Layout.window.height,
    flex: 1
  }
});
