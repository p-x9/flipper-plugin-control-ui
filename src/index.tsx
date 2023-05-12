import React from 'react';
import {
  Row,
  Col,
  Card,
  Divider,
} from 'antd';

import {
  PluginClient,
  usePlugin,
  createState,
  useValue,
  Layout,
  styled,
  _Sidebar as ResizablePanel,
  DetailSidebar
} from 'flipper-plugin';

type Events = {
  deviceSize: Size;
};

type Size = {
  width: number;
  height: number;
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
  const deviceSize = createState<Size>({width: 375, height:812});
  const mainWindowSize = createState<Size>({width: 375, height: 812});

  client.onMessage('deviceSize', (newDeviceSize) => {
    // deviceSize.update((draft) => {
    //   draft = newDeviceSize;
    // });
    deviceSize.set(newDeviceSize)
    console.log(deviceSize)
  });

  // client.addMenuEntry({
  //   action: 'clear',
  //   handler: async () => {
  //     data.set({});
  //   },
  //   accelerator: 'ctrl+l',
  // });

  return { deviceSize, mainWindowSize };
}

const contaierStyle = {
  border: "solid 2px #ff0000",
  height: "100%",
  width: '100%',
}

const centerInnerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  margin: 'auto'
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const deviceSize = useValue(instance.deviceSize);
  const mainWindowSize = useValue(instance.mainWindowSize);

  return (
    <Layout.Container grow padh="small" padv="medium">
      <Layout.Container grow padh="small" padv="medium">
        <Layout.Top>
          <ResizablePanel position='top' minHeight={200} height={mainWindowSize.height} maxHeight={800} width={mainWindowSize.width} gutter onResize={(width, height) => {
            instance.mainWindowSize.set({width: width, height: height});
          }}>
            <Layout.Container grow style={{ height: "100%", width: "100%", position: 'relative' }}>
              <AspectRatioCard aspectRatio={deviceSize.width / deviceSize.height} parentSize={mainWindowSize} style={centerInnerStyle}>
                <div style={contaierStyle}></div>
              </AspectRatioCard>
            </Layout.Container>
          </ResizablePanel>
          <ResizablePanel position='bottom' minHeight={200} height={400}>
            <h1>Log Window</h1>
          </ResizablePanel>
        </Layout.Top>
      </Layout.Container>

      <DetailSidebar>
        <h1>Preference Window</h1>
      </DetailSidebar>

    </Layout.Container>
  );
}

interface FixedAspectRatioCardProps {
  aspectRatio: number;
  children: React.ReactNode;
}

const FixedAspectRatioCard = ({
  aspectRatio,
  children,
}: FixedAspectRatioCardProps) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ paddingTop: `${(1 / aspectRatio) * 100}%` }} />
      <Card
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {children}
      </Card>
    </div>
  );
};

export default FixedAspectRatioCard;


interface AspectRatioCardProps {
  aspectRatio: number;
  parentSize: Size;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const AspectRatioCard: React.FC<AspectRatioCardProps> = ({ aspectRatio, parentSize, children, style }) => {
  const isLandscape = aspectRatio < (parentSize.width / parentSize.height);
  const cardStyle = isLandscape
    ? { height: `100%`, aspectRatio: aspectRatio, margin: 'auto', ...style }
    : { width: `100%`, aspectRatio: aspectRatio, margin: 'auto', ...style };
  return (
    <div style={cardStyle}>
      {children}
    </div>
  );
};
