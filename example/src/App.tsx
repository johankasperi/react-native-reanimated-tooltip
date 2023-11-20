import { PortalProvider } from '@gorhom/portal';
import React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { Tooltip } from 'react-native-reanimated-tooltip';

export default function App() {
  const [tooltip1Active, setTooltip1Active] = React.useState(false);
  const [tooltip2Active, setTooltip2Active] = React.useState(false);

  return (
    <PortalProvider>
      <View style={styles.container}>
        <View>
          <Tooltip
            content={
              <>
                <Text style={styles.tooltipHeadline}>Tooltip</Text>
                <Text style={styles.tooltipBody}>Body</Text>
              </>
            }
            visible={tooltip1Active}
            entering={FadeIn}
            exiting={FadeOut.duration(1000)}
          >
            <Button
              title="Toggle tooltip"
              onPress={() => {
                setTooltip1Active(!tooltip1Active);
              }}
            />
          </Tooltip>
        </View>
        <View style={styles.tooltip2}>
          <Tooltip
            content={
              <>
                <Text style={styles.tooltipHeadline}>Tooltip 2</Text>
                <Text style={styles.tooltipBody}>Body 2</Text>
              </>
            }
            visible={tooltip2Active}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <Button
              title="Toggle tooltip 2"
              onPress={() => {
                setTooltip2Active(!tooltip2Active);
              }}
            />
          </Tooltip>
        </View>
      </View>
    </PortalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
