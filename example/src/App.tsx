import React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { FadeOut, FadeIn } from 'react-native-reanimated';
import { Tooltip } from 'react-native-reanimated-tooltip';

export default function App() {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <View>
        <Tooltip
          content={
            <>
              <Text style={styles.tooltipHeadline}>Tooltip</Text>
              <Text style={styles.tooltipBody}>Body</Text>
            </>
          }
          visible={visible}
          onPress={() => {
            setVisible(false);
          }}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Button
            title="Toggle tooltip"
            onPress={() => {
              setVisible(true);
            }}
          />
        </Tooltip>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipHeadline: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  tooltipBody: { color: '#84848C', fontSize: 14 },
});
