# react-native-reanimated-tooltip

Tooltip for React Native using React Native Reanimated and Modal

![Demo 1](./demo/1.gif)

## Installation

```sh
npm install react-native-reanimated react-native-reanimated-tooltip
```

## Usage

```ts
import React from 'react';
import { Text, Button } from 'react-native';
import { Tooltip } from 'react-native-reanimated-tooltip';
import { FadeOut, FadeIn } from 'react-native-reanimated';

const [visible, setVisible] = React.useState(false);
<Tooltip
  content={
    <Text>Tooltip</Text>
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

```

## Configuration

Check [TooltipProps](https://github.com/johankasperi/react-native-reanimated-tooltip/blob/efd333ae9dea7d1705a8828f2a82ba65338956f2/src/Tooltip.tsx#L29)

## Demo

![Demo 2](./demo/2.gif)
![Demo 3](./demo/3.gif)
![Demo 4](./demo/4.gif)
![Demo 5](./demo/5.gif)
![Demo 6](./demo/6.gif)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
