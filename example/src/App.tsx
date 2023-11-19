import React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { Tooltip } from 'react-native-reanimated-tooltip';

export default function App() {
  const [activeTooltip, setActiveTooltip] = React.useState<1 | 2 | undefined>(
    undefined
  );

  return (
    <View style={styles.container}>
      <View>
        <Tooltip
          id={1}
          content={
            <>
              <Text style={styles.tooltipHeadline}>Tooltip</Text>
              <Text style={styles.tooltipBody}>Body</Text>
            </>
          }
          visible={activeTooltip === 1}
          entering={FadeIn}
          exiting={FadeOut.duration(1000)}
        >
          <Button
            title="Toggle tooltip"
            onPress={() => {
              setActiveTooltip(activeTooltip === 1 ? undefined : 1);
            }}
          />
        </Tooltip>
      </View>
      {/* <View style={styles.tooltip2}>
        <Tooltip
          id={2}
          content={
            <>
              <Text style={styles.tooltipHeadline}>Tooltip 2</Text>
              <Text style={styles.tooltipBody}>Body 2</Text>
            </>
          }
          visible={activeTooltip === 2}
          onClose={() => {
            setActiveTooltip(undefined);
          }}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Button
            title="Toggle tooltip 2"
            onPress={() => {
              setActiveTooltip(2);
            }}
          />
        </Tooltip>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tooltip2: { marginTop: 200, marginLeft: -100 },
  tooltipHeadline: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  tooltipBody: { color: '#84848C', fontSize: 14 },
});
