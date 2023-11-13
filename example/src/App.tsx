import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { Tooltip } from 'react-native-reanimated-tooltip';

export default function App() {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <Tooltip
        content={<Text>Hejj</Text>}
        visible={visible}
        onPress={() => {
          setVisible(!visible);
        }}
      >
        <Button
          title="Toggle tooltip"
          onPress={() => {
            setVisible(!visible);
          }}
        />
      </Tooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
