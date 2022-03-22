import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from "react-native";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import _ from "lodash";
import { Text, View } from "../../components/Themed";
import RNPickerSelect from "react-native-picker-select";
import { CheckoutStore } from "../../stores/CheckoutStore";
import { observer } from "mobx-react-lite";
import OrderedItem from "../../components/OrderedItem";
import Icon from "../../assets/icons/arrow";
import Layout from "../../constants/Layout";
import { useNavigation } from "@react-navigation/core";
import { Format } from "../../utils";
import { CouponStore } from "../../stores/CouponStore";

const SelectCouponScreen = observer(() => {
  const [state] = useState(CheckoutStore);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState({
    product:
      state.selectedCoupons_product.length > 0
        ? state.selectedCoupons_product
        : Array.from(Array(state.products.products.length).fill({ item: "", coupon: "" })),
    cart: state.selectedCoupons_cart !== "" ? state.selectedCoupons_cart : ""
  });
  const navigation = useNavigation();

  const refreshControl = async () => {
    setRefreshing(true);
    CouponStore.setLoading(true);
    await loadCoupons(1);
    setRefreshing(false);
  };
  const loadCoupons = async (page: number) => {
    while (true) {
      let cnt = CouponStore.mycoupons.length;
      await CouponStore.getcoupon(page, true);
      page++;
      if (cnt === CouponStore.mycoupons.length) {
        break;
      }
    }
    state.checkPossibleCoupons();
  };
  useEffect(() => {
    loadCoupons(1);
  }, []);
  useEffect(() => {
    if (
      !_.isEqual(Array.from(Array(state.products.products.length).fill({ item: "", coupon: "" })), selectedCoupons.product) &&
      selectedCoupons.cart !== "" &&
      CouponStore.mycoupons.find((coupon: any) => coupon._id === selectedCoupons.cart).only === true
    ) {
      setSelectedCoupons({ ...selectedCoupons, cart: "" });
      alert("중복하여 사용할 수 없는 쿠폰입니다.\n장바구니 쿠폰이 해제됩니다.");
    }
  }, [selectedCoupons.cart, selectedCoupons.product]);
  return (
    <View style={{ flex: 1 }}>
      <HeaderWithBackButton headerTitle={"쿠폰 선택"} showIcon={false} />
      {_.isEmpty(state.possibleCartCoupon) &&
      _.isEqual(Array.from(Array(state.products.products.length).fill([])), state.possibleProductCoupon) ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshControl} />}
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container_notice}>
            <Text style={styles.text_notice}>사용가능한 쿠폰이 없습니다.</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshControl} />}
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ ...styles.container_title, marginTop: 20 }}>
            <Text style={styles.text_title}>상품 쿠폰</Text>
          </View>
          {!_.isEmpty(state.possibleProductCoupon) ? (
            state.possibleProductCoupon.map((product: any, index: number) => (
              <View key={index}>
                <OrderedItem
                  key={index}
                  thumbnail={state.products.products[index].thumbnail}
                  name={state.products.products[index].name}
                  variant={state.products.products[index].variant_name}
                  quantity={state.products.products[index].quantity}
                  price={state.products.products[index].price_by_quantity}
                  divider={false}
                />
                {product.length > 0 ? (
                  <>
                    {selectedCoupons.product[index].coupon !== "" ? (
                      <View style={styles.container_coupon_price}>
                        <Text style={styles.text_coupon_price}>
                          {"-" +
                            Format.numberCommaFormat(
                              state.compute_coupon_discount_price(
                                state.products.products[index].price_by_quantity,
                                selectedCoupons.product[index].coupon,
                                index
                              )
                            ) +
                            " 원"}
                        </Text>
                      </View>
                    ) : (
                      <></>
                    )}
                    <RNPickerSelect
                      value={selectedCoupons.product[index].coupon}
                      onValueChange={(value) => {
                        setSelectedCoupons({
                          ...selectedCoupons,
                          product: selectedCoupons.product
                            .slice(0, index)
                            .concat(
                              value === ""
                                ? { item: "", coupon: "" }
                                : { item: state.products.products[index]._id, coupon: value }
                            )
                            .concat(selectedCoupons.product.slice(index + 1, selectedCoupons.product.length))
                        });
                      }}
                      doneText={"완료"}
                      Icon={() => <Icon name={"arrowBoldRotate"} />}
                      items={(() =>
                        product
                          .filter(
                            (item: any) =>
                              selectedCoupons.product.findIndex((coupons: any) => coupons.coupon === item._id) === -1 ||
                              selectedCoupons.product.findIndex((coupons: any) => coupons.coupon === item._id) === index
                          )
                          .map((coupon: any) => ({
                            label: coupon.name + ` (${coupon.discount.value.formatted})`,
                            value: coupon._id
                          })))()}
                      useNativeAndroidPickerStyle={false}
                      placeholder={{
                        label: "쿠폰을 선택해주세요",
                        value: ""
                      }}
                      style={{
                        placeholder: styles.text_select,
                        iconContainer: styles.container_icon_select,
                        inputAndroidContainer: styles.container_select,
                        inputIOSContainer: styles.container_select,
                        inputAndroid: styles.text_select,
                        inputIOS: styles.text_select
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
                <View
                  style={{
                    ...styles.separater,
                    borderBottomColor: index === state.possibleProductCoupon.length - 1 ? "#ffffff" : "#e2e2e2"
                  }}
                />
              </View>
            ))
          ) : (
            <></>
          )}
          <View style={styles.container_title}>
            <Text style={styles.text_title}>장바구니 쿠폰</Text>
          </View>
          <View style={{ marginVertical: 20, marginBottom: 150 }}>
            {selectedCoupons.cart !== "" ? (
              <View style={styles.container_coupon_price}>
                <Text style={styles.text_coupon_price}>
                  {"-" +
                    Format.numberCommaFormat(
                      state.compute_coupon_discount_price(state.products.total_price, selectedCoupons.cart)
                    ) +
                    " 원"}
                </Text>
              </View>
            ) : (
              <></>
            )}
            <RNPickerSelect
              value={selectedCoupons.cart}
              onValueChange={(value) => {
                setSelectedCoupons({ ...selectedCoupons, cart: value });
              }}
              doneText={"완료"}
              Icon={() => <Icon name={"arrowBoldRotate"} />}
              items={(() =>
                state.possibleCartCoupon.map((coupon: any) => ({
                  label: coupon.name + ` (${coupon.discount.value.formatted})`,
                  value: coupon._id
                })))()}
              useNativeAndroidPickerStyle={false}
              placeholder={{
                label: "쿠폰을 선택해주세요",
                value: ""
              }}
              style={{
                placeholder: styles.text_select,
                iconContainer: styles.container_icon_select,
                inputAndroidContainer: styles.container_select,
                inputIOSContainer: styles.container_select,
                inputAndroid: styles.text_select,
                inputIOS: styles.text_select
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              state.setSelectedCoupons(
                selectedCoupons.product
                  .filter((coupons: any) => coupons.coupon !== "")
                  .map((coupons: any) => coupons.coupon)
                  .concat(selectedCoupons.cart)
              );
              state.setSelectedCoupons_product(selectedCoupons.product.filter((coupons: any) => coupons.coupon !== ""));
              state.setSelectedCoupons_cart(selectedCoupons.cart);
              state.setCoupon_discount_price();
              navigation.goBack();
            }}
            style={styles.container_button}
          >
            <Text style={styles.text_button}>저장하기</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
});
export default SelectCouponScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16
  },
  container_notice: {
    marginVertical: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  text_notice: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 17 : 20,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#252525"
  },
  container_title: {
    height: 30,
    paddingBottom: 5,
    justifyContent: "center",
    borderStyle: "solid",
    borderBottomWidth: 2,
    borderBottomColor: "#252525"
  },
  text_title: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 15 : 18,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#252525"
  },
  container_select: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cacaca"
  },
  container_icon_select: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  text_select: {
    height: Platform.OS === "ios" ? 56 : 61,
    width: Layout.window.width - 64,
    opacity: 0.6,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 15 : 18,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#252525",
    textAlignVertical: "center"
  },
  separater: {
    borderBottomWidth: 1,
    marginVertical: 16
  },
  container_button: {
    height: 56,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 32,
    backgroundColor: "#ff7938"
  },
  text_button: {
    fontFamily: "NotoSansCJKkr-Medium",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#ffffff"
  },
  container_coupon_price: {
    height: 30,
    paddingBottom: 5,
    justifyContent: "center"
  },
  text_coupon_price: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 12 : 15,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#2d59da"
  }
});
