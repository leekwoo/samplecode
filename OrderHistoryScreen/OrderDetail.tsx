import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from "react-native";
import Layout from "../../constants/Layout";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import { observer } from "mobx-react-lite";
import Loading from "../../components/Loading";
import { Text, View } from "../../components/Themed";
import _ from "lodash";
import { OrderStore } from "../../stores/OrderStore";
import { Format } from "../../utils";

const OrderDetailScreen = observer(() => {
  const [state] = useState(OrderStore);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const hideOrderHistory = () => {
    Alert.alert(
      "잠시만요!",
      "주문 내역을 삭제하시겠습니까?\n삭제된 주문 건에 대한 문의사항은 고객센터에서 가능합니다.",
      [
        { text: "취소", style: "cancel", onPress: () => {} },
        {
          text: "확인",
          style: "destructive",
          //확인 버튼 누르면, 뒤로가기 && selectedImages 초기화
          onPress: async () => {
            setLoading(true);
            await state.hideOrderHistory(state.orderInfo._id);
            setLoading(false);
            navigation.goBack();
            return;
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton headerTitle={"상세내역"} />
      {loading ? <Loading overlay={true}/>: <></>}
      {OrderStore.detailLoading ? (
        <View style={{ alignItems: "center", flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
            <View style={{ width: Layout.window.width * 0.9, marginBottom: 60 }}>
              <View
                style={{
                  ...styles.container_title,
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <Text style={styles.text_title}>주문상품</Text>
                <Text style={styles.text_title}>{state.orderInfo._id}</Text>
              </View>
              <View style={{ ...styles.seperator_thick, marginVertical: 5 }} />
              {state.orderInfo.items.map((item, index) => (
                <View
                  style={{
                    flexDirection: "row",
                    height: 93,
                    justifyContent: "flex-start",
                    marginBottom: 16,
                    flex: 1,
                    marginTop: 10
                  }}
                  key={index}
                >
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ItemDetail", { ID: item.product._id });
                    }}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.product.thumbnail.url }} style={styles.thumbnail} />
                  </TouchableOpacity>
                  <View style={styles.container_product}>
                    <Text
                      style={{ ...styles.text_name, width: Layout.window.width * 0.9 - 108 }}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                    >
                      {item.product.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", height: 35 }}>
                      <View style={styles.container_badge}>
                        <Text
                          style={{
                            ...styles.text_name,
                            fontSize: 11,
                            opacity: 0.4,
                            lineHeight: 13
                          }}
                        >
                          옵션
                        </Text>
                      </View>
                      <View style={styles.container_options}>
                        {item.variant.types.length == 0 ? (
                          <Text
                            style={{
                              ...styles.text_name,
                              maxWidth: Layout.window.width * 0.9 - 173,
                              fontSize: 12,
                              opacity: 0.5,
                              lineHeight: 15
                            }}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                          >
                            {item.product.name}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              ...styles.text_name,
                              maxWidth: Layout.window.width * 0.9 - 173,
                              fontSize: 12,
                              opacity: 0.5,
                              lineHeight: 15
                            }}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                          >
                            {item.variant.types.length > 0
                              ? item.variant.types
                                  .map((variants: any) => variants.variation.value)
                                  .join("/")
                              : item.product.name}
                          </Text>
                        )}
                        <Text
                          style={{
                            ...styles.text_name,
                            opacity: 0.5,
                            paddingLeft: 4,
                            fontSize: 12,
                            lineHeight: 15
                          }}
                        >
                          | {item.quantity}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.container_price}>
                      <Text style={{ ...styles.text_price, color: "#ff7938" }}>
                        {Format.numberCommaFormat(item.price.sale) + "원"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              <View style={{ ...styles.container_title, height: 25 }}>
                <Text style={styles.text_title}>배송지 정보</Text>
              </View>
              <View style={styles.seperator_thick} />
              <View style={{ ...styles.container_name }}>
                <Text style={styles.text_name}>{state.orderInfo.address.shipping.name.full}</Text>
              </View>
              <View style={styles.container_mobile}>
                <Text style={styles.text_mobile}>{state.orderInfo.address.shipping.mobile}</Text>
              </View>
              <View style={styles.container_address}>
                <Text style={styles.text_address}>{state.orderInfo.address.shipping.address1}</Text>
                <Text style={styles.text_address}>{state.orderInfo.address.shipping.address2}</Text>
              </View>
              <View style={{ ...styles.container_title, height: 25 }}>
                <Text style={styles.text_title}>운송장 번호</Text>
              </View>
              <View style={styles.seperator_thick} />
              {!_.isEmpty(state.orderInfo.fulfillments.map) ? (
                state.orderInfo.fulfillments.map((item, index) => (
                  <View style={styles.container_name} key={index}>
                    <Text style={styles.text_name}>{item.tracking.uid}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.text_name}>택배가 발송되면 운송장이 여기에 나타납니다. </Text>
              )}
              {state.orderInfo.request == null ? (
                <>
                  <View style={{ ...styles.seperator_thin, marginBottom: 25 }} />
                  <View style={styles.container_mobile}>
                    <Text style={styles.text_mobile}>배송시 요청사항</Text>
                  </View>
                  <View style={styles.container_address}>
                    <Text style={styles.text_address}>배송시 요청사항 없음</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={{ ...styles.seperator_thin, marginBottom: 25 }} />
                  <View style={styles.container_mobile}>
                    <Text style={styles.text_mobile}>배송시 요청사항</Text>
                  </View>
                  <View style={styles.container_address}>
                    <Text style={styles.text_address}>{state.orderInfo.request}</Text>
                  </View>
                </>
              )}
              {!_.isEmpty(state.orderInfo.meta.PCCC) ? (
                <>
                  <View style={{ ...styles.container_title, height: 25 }}>
                    <Text style={styles.text_title}>개인통관 고유부호</Text>
                  </View>
                  <View style={styles.seperator_thick} />
                  <View style={styles.container_name}>
                    <Text style={styles.text_name}>{state.orderInfo.meta.PCCC}</Text>
                  </View>
                </>
              ) : (
                <></>
              )}
              <View style={{ ...styles.container_title, height: 25 }}>
                <Text style={styles.text_title}>주문자 정보</Text>
              </View>
              <View style={styles.seperator_thick} />
              <View style={styles.container_name}>
                <Text style={styles.text_name}>{state.orderInfo.address.shipping.name.full}</Text>
              </View>
              <View style={styles.container_mobile}>
                <Text style={styles.text_mobile}>{state.orderInfo.customer.mobile}</Text>
              </View>
              <View style={styles.container_mobile}>
                <Text style={styles.text_mobile}>{state.orderInfo.customer.email}</Text>
              </View>
              <View
                style={{
                  ...styles.container_title,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  height: 35
                }}
              >
                <Text style={styles.text_title}>결제정보</Text>
                <Text style={styles.text_title}>
                  {state.orderInfo.done == true
                    ? "수령완료"
                    : state.getPaymentStatus(state.orderInfo.status)}
                </Text>
              </View>
              <View style={styles.seperator_thick} />
              <View style={styles.canceled_info}>
                <Text style={styles.text_mobile}>상품금액</Text>
                <Text style={styles.text_mobile}>
                  {Format.numberCommaFormat(state.orderInfo.total.items.price.withTax)}원
                </Text>
              </View>
              <View style={styles.canceled_info}>
                <Text style={styles.text_mobile}>배송비</Text>
                <Text style={styles.text_mobile}>
                  +{Format.numberCommaFormat(state.orderInfo.total.shipping.fee.withTax)}원
                </Text>
              </View>
              <View>
                {state.getCouponSale() == 0 ? (
                  <></>
                ) : (
                  <View style={styles.canceled_info}>
                    <Text style={styles.text_mobile}>쿠폰할인</Text>
                    <Text style={styles.text_mobile}>
                      -{Format.numberCommaFormat(state.getCouponSale())}원
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ ...styles.seperator_thin, marginBottom: 25 }} />
              {state.orderInfo.total.price.sale == state.orderInfo.transactions[0].paid ? (
                <></>
              ) : (
                <View style={styles.container_total}>
                  <Text style={styles.text_total}>결제예정금액</Text>
                  <Text style={{ ...styles.text_total, color: "#ff7938" }}>
                    {Format.numberCommaFormat(
                      state.orderInfo.total.price.sale -
                        Number(state.orderInfo.transactions[0].paid)
                    )}
                    원
                  </Text>
                </View>
              )}
              <View style={styles.container_total}>
                <Text style={styles.text_total}>결제금액</Text>
                <Text style={{ ...styles.text_total, color: "#ff7938" }}>
                  {Format.numberCommaFormat(Number(state.orderInfo.transactions[0].paid))}원
                </Text>
              </View>
              <View style={{ ...styles.container_total }}>
                <Text style={styles.text_total}>결제방식 </Text>
                <Text style={{ ...styles.text_total, color: "#ff7938" }}>
                  {state.returnPaymentInfo(state.paymentInfo.pay_method)}
                </Text>
              </View>
              <View>
                {state.orderInfo.transactions[0].vbanks.map((item, index) => (
                  <View style={{ ...styles.canceled_info, flex: 1 }} key={index}>
                    <Text style={{ ...styles.text_mobile }}>{item.name}</Text>
                    {!(
                      state.orderInfo.status == "placed" || state.orderInfo.status == "under-paid"
                    ) ? (
                      <Text style={styles.text_mobile}>
                        {" "}
                        {Format.numberCommaFormat(Number(state.orderInfo.transactions[0].paid))}원
                      </Text>
                    ) : (
                      <Text style={styles.text_mobile} key={index}>
                        {" "}
                        {" " + Format.numberCommaFormat(item.amount.raw)}원
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              {!(state.orderInfo.status == "placed" || state.orderInfo.status == "under-paid") ? (
                <View style={{ ...styles.canceled_info }}>
                  <Text style={styles.text_mobile}>결제일시</Text>
                  <Text style={styles.text_mobile}>
                    {state.returnPaidtime(state.paymentInfo.paid_at)}
                  </Text>
                </View>
              ) : (
                state.orderInfo.transactions[0].vbanks.map((item, index) => (
                  <View style={{ ...styles.canceled_info, flexDirection: "column" }} key={index}>
                    <Text style={styles.text_mobile}>입금계좌 {item.number}</Text>
                    <Text style={styles.text_mobile}>
                      입금기한 {state.paidDate(item.expiresAt.raw)}
                    </Text>
                  </View>
                ))
              )}
              {state.orderInfo.done === true || state.orderInfo.status === "cancelled" ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ ...styles.container_button, marginTop: 45 }}
                  onPress={hideOrderHistory}
                >
                  <Text style={styles.text_button}>주문 내역 삭제</Text>
                </TouchableOpacity>
              ) : (
                <></>
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <Loading overlay={true} />
      )}
    </View>
  );
});

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container_product: {},
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
    //justifyContent: "center",
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
  container_title: {
    marginTop: 32,
    height: 35,
    justifyContent: "center"
  },
  text_title: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525"
  },
  seperator_thick: {
    backgroundColor: "#252525",
    height: 2,
    marginVertical: 7
  },
  container_name: {
    justifyContent: "center",
    flexDirection: "column"
  },
  text_name: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525",
    lineHeight: 22
  },
  container_mobile: {
    marginTop: 6,
    height: 23,
    justifyContent: "center"
  },
  text_mobile: {
    opacity: 0.8,
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525",
    lineHeight: 20
  },
  container_address: {
    marginTop: 6
  },
  text_address: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525",
    lineHeight: 25
  },
  seperator_thin: {
    backgroundColor: "#e2e2e2",
    height: 1,
    marginTop: 25,
    marginBottom: 12
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
  thumbnail: {
    width: 93,
    height: 93,
    resizeMode: "cover",
    marginRight: 15
  },
  container_badge: {
    width: 32,
    height: 20,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#b5b5b5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5
  },
  container_options: {
    marginLeft: 8,
    flexDirection: "row",
    height: 20,
    alignItems: "center",
    width: Layout.window.width * 0.5,
    marginTop: 5
  },
  container_price: {
    height: 30,
    justifyContent: "center"
  },
  text_price: {
    fontFamily: "NotoSansCJKkr-Medium",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#000000",
    lineHeight: 24
  },
  canceled_info: {
    marginTop: 3,
    height: 25,
    justifyContent: "space-between",
    flexDirection: "row"
  },
  text_total: {
    opacity: 0.8,
    fontFamily: "NotoSansCJKkr-Medium",
    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#252525",
    lineHeight: 24
  },
  container_total: {
    marginTop: 6,
    height: 30,
    justifyContent: "space-between",
    flexDirection: "row"
  },
  container_button: {
    flex: 0.49,
    height: 40,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ff0606",
    justifyContent: "center",
    alignItems: "center"
  },
  text_button: {
    fontFamily: "NotoSansCJKkr-Regular",
    fontSize: Layout.isSmallDevice ? 13 : 16,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#ff0606"
  }
});
