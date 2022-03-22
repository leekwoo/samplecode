import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import RNPickerSelect from "react-native-picker-select";
import Icon from "../../assets/icons/arrow";
import { View, Text } from "../../components/Themed";
import Loading from "../../components/Loading";
import _ from "lodash";
import OrderedItem from "../../components/OrderedItem";
import PriceInfoCard from "../../components/PriceInfoCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import Layout from "../../constants/Layout";
import { CheckoutStore } from "../../stores/CheckoutStore";
import { Format, Toast } from "../../utils";
import { OrderStore } from "../../stores/OrderStore";
import { UserAuthStore } from "../../stores/UserAuthStore";

const CancelRefundScreen = observer(() => {
  const bankCodeList = {
    "04": "KB국민",
    "88": "신한",
    "20": "우리",
    "11": "NH농협",
    "81": "하나",
    "03": "IBK기업",
    "23": "SC제일",
    "53": "씨티",
    "37": "전북",
    "34": "광주",
    "31": "대구",
    "32": "부산",
    "39": "경남",
    "02": "KDB산업",
    "45": "새마을",
    "48": "신협",
    "07": "수협",
    "16": "축협",
    "71": "우체국",
    "90": "카카오뱅크",
    "89": "케이뱅크"
  };
  const navigation = useNavigation();
  const route = useRoute(); //param으로 받은 정보를 사용하기 위해
  //Mode: cancel -> 취소, refund -> 환불
  const Mode = route.params.Mode;
  //해당 order
  const Order = route.params.Order;
  const [paymnetInfo, setPaymentInfo] = useState("");
  const [reason, setReason] = useState("");
  const [needRefundAccount, setNeedRefundAccount] = useState(false);
  const [quantity, setQuantity] = useState(Array(Order.items.length).fill(0));
  const [loading, setLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const [expectedPrice, setExpectedPrice] = useState({ item: 0, shipping: 0, coupon: 0 });
  const [requestedRefund, setRequestedRefund] = useState(
    Order.refunds
      .filter((refund: any) => _.isNull(refund.cancellation))
      .map((refund: any) =>
        refund.items.map((item: any) => ({ _id: item.item.product._id, quantity: 0 }))
      )
      .flat()
  );
  const possibleReason = [
    "단순 변심",
    "상품 옵션 변경(색상, 사이즈 등)",
    "상품 오배송",
    "상품 불량"
  ];
  let vendor = new Set<string>(Order.items.map((item: any) => item.vendor.name));

  const deletePrintedVendor = (name: string) => {
    if (vendor.size === 0) {
      return;
    }
    vendor.delete(name);
  };

  const fetchPaymentInfo = async () => {
    await OrderStore.fetchPaymentInfo(Order._id).then(() => {
      setPaymentInfo(OrderStore.paymentInfo.pay_method);
    });
  };

  const computePrice = () => {
    let item = 0;
    let shipping = 0;
    let vendor = new Set();
    //상품쿠폰
    let coupon = 0;

    for (let idx in quantity) {
      if (quantity[idx] > 0) {
        item +=
          (Order.items[idx].discounts.length > 0
            ? Order.items[idx].discounts[0].after / Order.items[idx].quantity
            : Order.items[idx].price.sale / Order.items[idx].quantity) * quantity[idx];
        coupon +=
          Order.items[idx].discounts.length > 0
            ? Math.round(
                ((Order.items[idx].discounts[0].after - Order.items[idx].total.price.sale) /
                  Order.items[idx].quantity) *
                  quantity[idx]
              )
            : 0;
        if (!vendor.has(Order.items[idx].vendor._id)) {
          vendor.add(Order.items[idx].vendor._id);
        }
      }
    }

    for (let shipment of Order.shipments) {
      if (
        shipment.type === "bundled" &&
        shipment.vendor !== undefined &&
        vendor.has(shipment.vendor._id)
      ) {
        let flag = true;
        for (let product of shipment.items) {
          let idx = Order.items.findIndex((item: any) => item._id === product._id);
          if (Order.items[idx].quantity !== quantity[idx]) {
            flag = false;
            break;
          }
        }
        if (flag) {
          //해당 입점사의 물건을 모두(개수까지) 환불하는 경우에 배송비 환불!
          shipping += shipment.fee.original;
        }
      } else if (shipment.type === "separated") {
        let idx = Order.items.findIndex((item: any) => item._id === shipment.items[0]._id);
        if (Order.items[idx].quantity === quantity[idx]) {
          shipping += shipment.fee.original;
        }
      }
    }
    setExpectedPrice({ item: item, shipping: shipping, coupon: coupon });
  };

  useEffect(() => {
    if (Mode === "refund") {
      if (Order.transactions[0].vbanks.length > 0) {
        //무통장 입금 결제건이면, 환불 계좌 정보가 등록되어있는지 확인.
        UserAuthStore.fetchRefundAccount();
        setNeedRefundAccount(true);
      }
      fetchPaymentInfo();
    }
    let temp = Order.items.map((item: any) => ({ _id: item.product._id, quantity: 0 }));
    if (Order.refunds.length > 0) {
      for (let refund of Order.refunds) {
        if (_.isNull(refund.cancellation)) {
          for (let refundItem of refund.items) {
            let tempIdx = temp.findIndex(
              (request: any) => request._id === refundItem.item.product._id
            );
            if (tempIdx !== -1) {
              temp[tempIdx].quantity += refundItem.quantity;
            }
          }
        }
      }
      temp = temp.filter((item: any) => item.quantity !== 0);
      setRequestedRefund(temp);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (Mode === "cancel") {
      if (reason !== "") {
        setIsFull(true);
      } else {
        setIsFull(false);
      }
    } else {
      if (
        reason !== "" &&
        !_.isEqual(quantity, Array(Order.items.length).fill(0)) &&
        (!needRefundAccount || UserAuthStore.refundAccount.refund_account !== "")
      ) {
        setIsFull(true);
      } else {
        setIsFull(false);
      }
    }
  }, [reason, quantity]);

  useEffect(() => {
    computePrice();
  }, [quantity]);

  const callAPI = async () => {
    setLoading(true);
    if (Mode === "cancel") {
      await CheckoutStore.cancelCheckoutOrder(reason, Order._id)
        .then(async () => {
          await OrderStore.fetchOrderHistory();
          setLoading(false);
          Toast("주문이 취소되었습니다.");
        })
        .catch(() => {
          Toast("오류가 발생하였습니다. 다시 시도해주세요.");
        });
      navigation.goBack();
    } else {
      if (paymnetInfo === "phone") {
        //휴대폰 소액결제일 경우
        //1. 결제 월(月)과 환불 월(月)이 다르면 환불 불가
        let paid_at = new Date(OrderStore.paymentInfo.paid_at * 1000).getMonth() + 1;
        let now_date = new Date().getMonth() + 1;
        if (paid_at !== now_date) {
          alert("휴대폰 소액결제 건은 결제한 해당 월(月)에만 환불 가능합니다.");
          setLoading(false);
          return;
        }
        //2. 부분 환불 불가
        let total_quantity = 0;
        total_quantity += parseInt(Order.items.map((items: any) => items.quantity));
        let selectedQuantity = quantity.reduce((a, b) => a + b);
        if (total_quantity !== selectedQuantity) {
          alert("휴대폰 소액결제 건은 부분환불이 불가합니다.\n전체환불로 진행해주세요.");
          setLoading(false);
          return;
        }
      }
      let items = [];
      let shipments = new Set();
      for (let i = 0; i < Order.items.length; i++) {
        if (quantity[i] !== 0) {
          items.push({ item: Order.items[i]._id, quantity: quantity[i] });
          if (
            (Order.fulfillments.length === 0 || possibleReason.indexOf(reason) >= 2) &&
            shipments.has(Order.items[i].vendor._id)
          ) {
            shipments.add(
              Order.shipments.find(
                (shipment: any) => shipment.vendor._id === Order.items[i].vendor._id
              )._id
            );
          }
        }
      }
      if (shipments.size > 1) {
        setLoading(false);
        Toast("환불요청은 입점사별로 가능합니다.");
        return;
      }

      //shipments 필터링 (배송비 무료이거나, 이미 환불된 배송id를 제외시켜야함)
      if (expectedPrice.shipping === 0) {
        shipments.clear();
      } else {
        let temp = new Set();
        for (let shipping_id in shipments) {
          if (
            Order.shipments.find((shipment: any) => shipment.shipment._id === shipping_id) ===
            undefined
          ) {
            temp.add(shipping_id);
          }
        }
        shipments = temp;
      }

      let errorMsg = await OrderStore.requestRefund(
        Order._id,
        reason,
        items,
        Array.from(shipments)
      );
      if (errorMsg === "") {
        await OrderStore.fetchOrderHistory().then(() => {
          setLoading(false);
          Toast("환불요청이 접수되었습니다.");
        });
      } else {
        setLoading(false);
        if (errorMsg === "mismatchingVendor") {
          Toast("환불요청은 입점사별로 가능합니다.");
        } else {
          Toast("오류가 발생하였습니다. 다시 시도해주세요.");
        }
        return;
      }
      navigation.goBack();
    }
  };

  return (
    <>
      <HeaderWithBackButton headerTitle={Mode === "cancel" ? "주문 취소하기" : "환불 요청하기"} />
      {loading ? <Loading overlay={true} /> : <></>}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#ffffff" }}
        contentContainerStyle={{ backgroundColor: "#ffffff", paddingHorizontal: 16 }}
      >
        <View style={styles.container_notice}>
          <Text style={styles.text_notice}>{`${
            Mode === "cancel" ? "취소" : "환불"
          }할 주문을 확인한 후\n주문 ${
            Mode === "cancel" ? "취소" : "환불"
          } 사유를 선택해주세요.`}</Text>
        </View>
        <RNPickerSelect
          value={reason}
          onValueChange={(value) => {
            setReason(value);
          }}
          doneText={"완료"}
          Icon={() => <Icon name={"arrowBoldRotate"} />}
          items={possibleReason.map((reason: string) => ({
            label: reason,
            value: reason
          }))}
          useNativeAndroidPickerStyle={false}
          placeholder={{
            label: Mode === "cancel" ? "취소 사유를 선택해주세요." : "환불 사유를 선택해주세요.",
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
        {Mode === "refund" && requestedRefund.length > 0 ? (
          <>
            <View style={{ ...styles.container_notice, marginTop: 20, marginBottom: 0 }}>
              <Text style={styles.text_notice}>현재 접수된 환불 내역</Text>
            </View>
            {Order.refunds.map((refundItem: any, index: number) => (
              <View key={index}>
                {_.isNull(refundItem.cancellation) ? (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        height: 20,
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <View style={styles.container_info}>
                        <Text style={styles.text_info}>
                          {"접수일자 " +
                            [
                              refundItem.createdAt.slice(0, 4),
                              refundItem.createdAt.slice(5, 7),
                              refundItem.createdAt.slice(8, 10)
                            ].join(".")}
                        </Text>
                      </View>
                      {Order.status === "refunded" ||
                      refundItem.status === "requested" ||
                      refundItem.status === "accepted" ? (
                        Order.status === "refunded" ? (
                          //blue
                          <View style={styles.container_info}>
                            <Text style={{ ...styles.text_info, color: "#2d59da" }}>
                              {"환불완료"}
                            </Text>
                          </View>
                        ) : (
                          //red
                          <View style={styles.container_info}>
                            <Text style={{ ...styles.text_info, color: "#ff3939" }}>
                              {refundItem.status === "requested" ? "환불접수" : "환불승인"}
                            </Text>
                          </View>
                        )
                      ) : (
                        <></>
                      )}
                    </View>
                    {refundItem.items.map((item: any, index: number) => {
                      return (
                        <OrderedItem
                          key={index}
                          thumbnail={item.item.product.thumbnail.url}
                          name={item.item.product.name}
                          variant={
                            item.item.variant.types.length > 0
                              ? item.item.variant.types
                                  .map((variants: any) => variants.variation.value)
                                  .join("/").length > 27
                                ? item.item.variant.types
                                    .map((variants: any) => variants.variation.value)
                                    .join("/")
                                    .substring(0, 27) + "..."
                                : item.item.variant.types
                                    .map((variants: any) => variants.variation.value)
                                    .join("/")
                              : item.item.product.name
                          }
                          quantity={item.quantity}
                          divider={false}
                        />
                      );
                    })}
                    <View style={styles.container_price}>
                      <Text style={styles.text_price}>
                        {"예상 환불금액   " +
                          Format.numberCommaFormat(refundItem.total.price.withTax) +
                          "원"}
                      </Text>
                    </View>
                    {index < Order.refunds.length - 1 ? (
                      <View style={{ ...styles.separater, borderBottomColor: "#e2e2e2" }} />
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </View>
            ))}
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={styles.seperator_thick} />
            </View>
          </>
        ) : (
          <></>
        )}
        {Mode === "cancel" ? (
          <View style={{ marginTop: 30 }} />
        ) : (
          <>
            {!_.isEqual(
              requestedRefund,
              Order.items.map((item: any) => ({ _id: item.product._id, quantity: item.quantity }))
            ) ? (
              <View style={{ ...styles.container_notice, marginTop: 20, marginBottom: 10 }}>
                <Text style={styles.text_notice}>환불하려는 상품과 수량을 선택해주세요.</Text>
              </View>
            ) : (
              <></>
            )}
          </>
        )}
        {Order.items.map((product: any, index: number) => (
          <View key={index}>
            {requestedRefund.find((refund: any) => product.product._id === refund._id) ===
              undefined ||
            product.quantity -
              requestedRefund.find((refund: any) => product.product._id === refund._id).quantity >
              0 ? (
              <>
                {vendor.has(product.vendor.name) ? (
                  <View
                    style={{
                      ...styles.container_info,
                      alignItems: "center",
                      height: 25,
                      backgroundColor: "#e2e2e2",
                      borderRadius: 5
                    }}
                  >
                    {deletePrintedVendor(product.vendor.name)}
                    <Text style={styles.text_info}>{product.vendor.name}</Text>
                  </View>
                ) : (
                  <></>
                )}
                <OrderedItem
                  thumbnail={product.product.thumbnail.url}
                  name={product.product.name}
                  variant={
                    product.variant.types.length > 0
                      ? product.variant.types
                          .map((variants: any) => variants.variation.value)
                          .join("/").length > 27
                        ? product.variant.types
                            .map((variants: any) => variants.variation.value)
                            .join("/")
                            .substring(0, 27) + "..."
                        : product.variant.types
                            .map((variants: any) => variants.variation.value)
                            .join("/")
                      : product.product.name
                  }
                  quantity={
                    requestedRefund.find((refund: any) => product.product._id === refund._id) ===
                    undefined
                      ? product.quantity
                      : product.quantity -
                        requestedRefund.find((refund: any) => product.product._id === refund._id)
                          .quantity
                  }
                  price={Math.round(
                    requestedRefund.find((refund: any) => product.product._id === refund._id) ===
                      undefined
                      ? product.total.price.sale
                      : (product.total.price.sale / product.quantity) *
                          (product.quantity -
                            requestedRefund.find(
                              (refund: any) => product.product._id === refund._id
                            ).quantity)
                  )}
                  divider={false}
                />
                {Mode === "refund" ? (
                  <>
                    <RNPickerSelect
                      value={quantity[index]}
                      onValueChange={(value) => {
                        setQuantity(
                          quantity
                            .slice(0, index)
                            .concat(value)
                            .concat(quantity.slice(index + 1, quantity.length))
                        );
                      }}
                      doneText={"완료"}
                      Icon={() => <Icon name={"arrowBoldRotate"} />}
                      items={(() =>
                        Array(
                          requestedRefund.find(
                            (refund: any) => product.product._id === refund._id
                          ) === undefined
                            ? product.quantity
                            : product.quantity -
                                requestedRefund.find(
                                  (refund: any) => product.product._id === refund._id
                                ).quantity
                        )
                          .fill(0)
                          .map((order, index) => ({
                            label: String(index + 1),
                            value: index + 1
                          })))()}
                      useNativeAndroidPickerStyle={false}
                      placeholder={{
                        label: "환불하려는 상품의 수량을 선택해주세요.",
                        value: 0
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
                    <View
                      style={{
                        ...styles.separater,
                        borderBottomColor: index === Order.items.length - 1 ? "#ffffff" : "#e2e2e2"
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}
          </View>
        ))}
        <PriceInfoCard
          title={Mode === "cancel" ? "결제 내역" : "예상 환불금액"}
          product_price={Mode === "cancel" ? Order.total.items.price.sale : expectedPrice.item}
          shipping_fee={
            Mode === "cancel"
              ? Order.total.shipping.fee.sale
              : (Mode === "refund" && Order.fulfillments.length === 0) ||
                possibleReason.indexOf(reason) >= 2
              ? expectedPrice.shipping
              : 0
          }
          coupon_discount={
            Mode === "cancel"
              ? Order.total.price.sale -
                Order.total.items.price.sale -
                Order.total.shipping.fee.sale
              : expectedPrice.coupon
          }
          title_total={"최종금액"}
        />
        {Mode === "refund" && (
          <View style={{ ...styles.container_notice, marginTop: 0, marginBottom: 0 }}>
            <Text style={{ ...styles.text_notice, fontSize: Layout.isSmallDevice ? 10 : 13 }}>
              {
                "* 해당 금액은 예상 환불금액으로, 실제 환불금액과는 차이가 있을 수 있습니다. 자세한 사항은 고객센터로 문의해주시기 바랍니다."
              }
            </Text>
          </View>
        )}
        {needRefundAccount ? (
          <>
            <View style={{ ...styles.container_title, marginTop: 32 }}>
              <Text style={styles.text_title}>환불계좌정보</Text>
            </View>
            {!_.isNull(UserAuthStore.refundAccount.refund_account) ? (
              <View
                style={{
                  flexDirection: "row",
                  height: 59,
                  borderBottomColor: "#e2e2e2",
                  borderBottomWidth: 1,
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <View style={{ height: 30, justifyContent: "center" }}>
                  <Text style={styles.text_title}>
                    {bankCodeList[UserAuthStore.refundAccount.refund_bank] +
                      " " +
                      UserAuthStore.refundAccount.refund_account}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("RefundAccountModifyScreen");
                  }}
                  style={styles.container_modify}
                >
                  <Text style={styles.text_modify}>수정</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("RefundAccountModifyScreen");
                  }}
                  style={{ ...styles.container_modify_button, marginBottom: 24 }}
                >
                  <Text style={styles.text_modify_button}>환불계좌정보 추가하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <></>
        )}
        <View style={{ ...styles.container_notice, height: 100, marginTop: 20, marginBottom: 0 }}>
          <Text style={{ ...styles.text_notice, fontSize: Layout.isSmallDevice ? 10 : 13 }}>
            {
              "* 휴대폰 소액결제는 통신사 정책상 부분환불이 불가하며, 전액환불만 가능합니다. 또한, 결제가 이루어진 월(月)과 환불을 요청하는 월(月)이 다를 경우, 전액환불도 불가합니다. 자세한 사항은 고객센터로 문의해주시기 바랍니다."
            }
          </Text>
        </View>
        <TouchableOpacity
          disabled={!isFull}
          style={{ ...styles.container_button, backgroundColor: isFull ? "#ff7938" : "#bebebe" }}
          onPress={() => {
            callAPI();
          }}
        >
          <Text style={styles.text_button}>
            {Mode === "cancel" ? "주문 취소하기" : "환불 요청하기"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
});

export default CancelRefundScreen;

const styles = StyleSheet.create({
  container_notice: {
    height: 65,
    marginTop: 40,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  text_notice: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 15 : 18,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#252525"
  },
  container_price: {
    marginTop: -15,
    height: 30,
    justifyContent: "center"
  },
  text_price: {
    fontFamily: "NotoSansCJKkr-Medium",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#ff7938"
  },
  container_info: {
    height: 20,
    justifyContent: "center"
  },
  text_info: {
    opacity: 0.7,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 11 : 14,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#000000"
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
  seperator_thick: {
    width: Layout.window.width + 100,
    height: 15,
    backgroundColor: "#f6f6f6",
    marginTop: 28,
    marginBottom: 10
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
  container_modify: {
    width: 48,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#252525"
  },
  text_modify: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 11 : 14,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525"
  },
  container_modify_button: {
    height: 60,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#252525",
    justifyContent: "center",
    alignItems: "center"
  },
  text_modify_button: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525"
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
