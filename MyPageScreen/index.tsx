import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { View } from "../../components/Themed";
import { observer } from "mobx-react-lite";
import { UserAuthStore } from "../../stores/UserAuthStore";
import HeaderWithTitle from "../../components/HeaderWithTitle";
import Login from "../LoginScreen";
//import MypageTab from "../../router/MypageTopTabNavigator";
import MyShopping from "./MyShoppingTab";

const TabMyScreen = observer(() => {
  const [state] = useState(UserAuthStore);

  React.useEffect(() => {}, [state]);

  return (
    <View style={styles.container}>
      {state.isLogin ? <HeaderWithTitle headerTitle={"마이별쇼"} /> : <></>}
      {state.isLogin ? <MyShopping /> : <Login />}
    </View>
  );
});
export default TabMyScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
