import * as React from "react";
import { StyleSheet, FlatList } from "react-native";
import { Text, View } from "../../components/Themed";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import _ from "lodash";
import { observer } from "mobx-react";
import Loading from "../../components/Loading";
import UpperButton from "../../components/UpperButton";
import { OrderStore } from "../../stores/OrderStore";
import useHandleScroll from "../../hooks/useHandleScroll";
import OrderHistoryCard from "../../components/OrderHistoryCard";
import Layout from "../../constants/Layout";

const OrderHistoryScreen = observer(() => {
  const [state] = React.useState(OrderStore);
  const [refreshing, setRefreshing] = React.useState(false);
  const FlatlistRef = React.useRef<FlatList<any>>();
  const [page, setPage] = React.useState(_.isEmpty(state.orderHistory) ? 1 : Math.ceil(state.orderHistory.length / 120) + 1);
  const { handleScroll, showUpperButton } = useHandleScroll();
  let endReachCall: any;

  //새로고침하면 강제로 업데이트되도록
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderHistory(true).then(() => {
      setRefreshing(false);
    });
  };

  const fetchOrderHistory = async (force: boolean = false) => {
    setPage(_.isEmpty(state.orderHistory) ? 1 : Math.ceil(state.orderHistory.length / 120) + 1);
    await state.fetchOrderHistory(force ? 1 : page).then(() => {
      state.setLoading(false);
    });
    setPage(_.isEmpty(state.orderHistory) ? 1 : Math.ceil(state.orderHistory.length / 120) + 1);
  };
  React.useEffect(() => {
    fetchOrderHistory(true);
  }, []);

  return (
    <>
      <HeaderWithBackButton headerTitle={"주문 및 배송"} />
      {state.loading ? <Loading overlay={true} /> : <></>}
      {!_.isEmpty(state.orderHistory) ? (
        <>
          <FlatList
            ref={FlatlistRef}
            style={{ backgroundColor: "#fff" }}
            data={state.orderHistory}
            renderItem={({ item, index }) => <OrderHistoryCard order={item} divider={index < state.orderHistory.length - 1} />}
            keyExtractor={(item) => String(item._id)}
            showsVerticalScrollIndicator={false}
            bounces={true}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.container}
            onEndReached={() => {
              if (!endReachCall) {
                endReachCall = setTimeout(() => {
                  fetchOrderHistory();
                  endReachCall = false;
                }, 1000);
              }
            }}
            onEndReachedThreshold={0.1}
          />
          {showUpperButton && <UpperButton FlatlistRef={FlatlistRef} top={Layout.window.height - 80} />}
        </>
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1
          }}
        >
          <Text style={{ color: "gray", fontFamily: "NotoSansCJKkr-Medium" }}>주문 및 배송 이력이 없습니다</Text>
        </View>
      )}
    </>
  );
});
export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingBottom: 50,
    marginHorizontal: 16,
    backgroundColor: "#ffffff"
  }
});
