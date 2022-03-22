import * as React from "react";
import { ScrollView } from "react-native";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import _ from "lodash";
import { observer } from "mobx-react";
import { OrderStore } from "../../stores/OrderStore";
import OrderHistoryCard from "../../components/OrderHistoryCard";
import { useRoute } from "@react-navigation/native";

const SelectReviewScreen = observer(() => {
  const route = useRoute(); //param으로 받은 index를 사용하기 위해
  const [Order, setOrder] = React.useState(route.params.Order);
  const [state] = React.useState(OrderStore);

  React.useEffect(() => {
    let temp = state.orderHistory.find((order: any) => order._id === Order._id);
    if (temp !== undefined) {
      setOrder(temp);
    }
  }, [state.orderHistory]);
  return (
    <>
      <HeaderWithBackButton headerTitle={"상품 선택"} />
      <ScrollView
        style={{ paddingHorizontal: 16, backgroundColor: "#ffffff" }}
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 50, backgroundColor: "#ffffff" }}
      >
        {Order.items.map((order: any, index: number) => (
          <OrderHistoryCard
            key={index}
            order={Order}
            divider={index < Order.items.length - 1}
            itemIndex={index}
            detailMode={true}
          />
        ))}
      </ScrollView>
    </>
  );
});
export default SelectReviewScreen;
