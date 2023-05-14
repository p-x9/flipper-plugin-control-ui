import React, { ChangeEvent, useEffect } from 'react';

import {
  Input,
  Button,
} from 'antd';

const {
  TextArea,
} = Input

import {
  PluginClient,
  usePlugin,
  createState,
  useValue,
  Layout,
  styled,
  _Sidebar as ResizablePanel,
  DetailSidebar,
  DataTableColumn,
  DataTable,
  createDataSource,
} from 'flipper-plugin';

type Events = {
  deviceSize: Size;
  newEventLog: EventLog;
};

type Methods = {
  sendTouchEvent(event: TouchEvent): Promise<void>;
  sendKeyEvent(event: KeyEvent): Promise<void>;
};

type EventLog = {
  date: Date;
  type: "touch" | "key";
  message?: string;
};

type Size = {
  width: number;
  height: number;
}
type TouchPhase = "began" | "moved" | "ended"

type TouchEvent = {
  phase: TouchPhase,
  x: number,
  y: number
}

type KeyEvent = { text: { _0: string } } | { escape: {} } | { delete: {} } | { tab: {} } | { enter: {} }

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, Methods>) {
  const deviceSize = createState<Size>({ width: 375, height: 812 });
  const mainWindowSize = createState<Size>({ width: window.innerWidth - 300, height: window.innerHeight - 400 });
  const isDragging = createState<boolean>(false);

  const eventLogs = createDataSource<EventLog>([]);

  client.onMessage('deviceSize', (newDeviceSize) => {
    deviceSize.set(newDeviceSize)
    console.log(deviceSize)
  });

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      eventLogs.clear();
    },
    accelerator: 'ctrl+l',
  });

  async function sendTouchEvent(event: TouchEvent) {
    try {
      await client.send('sendTouchEvent', event);
    } catch (e) {
      console.error(e);
    }
  };

  async function sendKeyEvent(event: KeyEvent) {
    try {
      await client.send('sendKeyEvent', event);
    } catch (e) {
      console.error(e);
    }
  };

  return { deviceSize, mainWindowSize, isDragging, eventLogs, sendTouchEvent, sendKeyEvent, client };
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

const columns: DataTableColumn<EventLog>[] = [
  {
    title: 'Date',
    key: 'date',
    width: 120
  },
  {
    title: 'Type',
    key: 'type',
    width: 100
  },
  {
    title: 'Message',
    key: 'message',
    wrap: true
  },
];


// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const deviceSize = useValue(instance.deviceSize);
  const mainWindowSize = useValue(instance.mainWindowSize);
  const isDragging = useValue(instance.isDragging);

  const controlWindowRef = React.createRef<HTMLDivElement>();

  const textToSend = createState<string>('');

  //   useEffect(() => {
  //     document.addEventListener('keydown', handleKeyDownEvent);
  //     document.addEventListener('keyup', handleKeyUpEvent);

  //     return () => {
  //         document.removeEventListener('keydown', handleKeyDownEvent);
  //         document.removeEventListener('keyup', handleKeyUpEvent);
  //     };
  // }, []);

  //   const handleKeyDownEvent = (event: KeyboardEvent) => {
  //     console.log(`Key pressed: ${event.key} ${event.code}`);
  //     sendKeyEvent(event, true)
  //   };

  //   const handleKeyUpEvent = (event: KeyboardEvent) => {
  //     console.log(`Key pressed: ${event.key} ${event.code}`);
  //     sendKeyEvent(event, false)
  //   };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!controlWindowRef.current) {
      instance.isDragging.set(false);
      sendTouchEvent(event, "ended");
      return
    }
    instance.isDragging.set(true);

    sendTouchEvent(event, "began");
  };

  const handleMouseMoved = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!controlWindowRef.current) {
      instance.isDragging.set(false);
      sendTouchEvent(event, "ended");
      return
    }
    if (isDragging) {
      sendTouchEvent(event, "moved");
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    instance.isDragging.set(false);

    sendTouchEvent(event, "ended");
  };

  const handleInputText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    textToSend.set(event.target.value);
  };

  const handleSendClick = () => {
    const text = textToSend.get()
    sendKeyEvent({ text: { _0: text } });
  }

  const sendTouchEvent = async (event: React.MouseEvent<HTMLDivElement>, phase: TouchPhase) => {
    if (!controlWindowRef.current) {
      return
    }
    const rect = controlWindowRef.current.getBoundingClientRect();
    const scale = rect.height / deviceSize.height;
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    console.log(`${phase} X: ${x}, Y: ${y}`);

    if (x < 0 || y < 0 || x > deviceSize.width || y > deviceSize.height) {
      if (isDragging) {
        instance.isDragging.set(false)
        instance.eventLogs.append({ date: new Date(), type: 'touch', message: `${'ended'} x: ${x.toFixed(2)}, y: ${y.toFixed(2)}` });
        const result = await instance.sendTouchEvent({ phase: 'ended', x: x, y: y });
      }
    } else {
      instance.eventLogs.append({ date: new Date(), type: 'touch', message: `${phase} x: ${x.toFixed(2)}, y: ${y.toFixed(2)}` });
      const result = await instance.sendTouchEvent({ phase: phase, x: x, y: y });
    }
  };

  const sendKeyEvent = (event: KeyEvent) => {
    instance.eventLogs.append({ date: new Date(), type: 'key', message: JSON.stringify(event) });
    instance.sendKeyEvent(event);
  }

  return (
    <Layout.Container grow padh="small">
      <Layout.Container grow padh="small" padv="medium">
        <SmallHeading style={{ marginTop: '4px' }}>Touch Event</SmallHeading>
        <Layout.Top>
          <ResizablePanel position='top' minHeight={200} height={mainWindowSize.height} maxHeight={800} width={mainWindowSize.width} gutter onResize={(width, height) => {
            instance.mainWindowSize.set({ width: width, height: height });
          }}>
            <Layout.Container grow style={{ height: "100%", width: "100%", position: 'relative' }}>
              <AspectRatioCard aspectRatio={deviceSize.width / deviceSize.height} parentSize={mainWindowSize} style={centerInnerStyle}>
                <div
                  ref={controlWindowRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMoved}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={contaierStyle}>
                </div>
              </AspectRatioCard>
            </Layout.Container>
          </ResizablePanel>

          <ResizablePanel position='bottom' minHeight={200} height={400}>
            <SmallHeading style={{ marginTop: '4px' }}>Keyboard Event</SmallHeading>
            <div style={{ display: 'flex', gap: '4px' }}>
              <TextArea rows={4} onChange={handleInputText} />
              <Button onClick={handleSendClick} style={{ marginTop: 'auto' }}>Send</Button>
            </div>
            <div style={{ display: 'flex', gap: '4px', margin: '4px'}}>
              <Button onClick={() => { sendKeyEvent({ escape: {} }) }}>Escape</Button>
              <Button onClick={() => { sendKeyEvent({ tab: {} }) }}>Tab</Button>
              <Button onClick={() => { sendKeyEvent({ enter: {} }) }}>Enter</Button>
              <Button onClick={() => { sendKeyEvent({ delete: {} }) }}>Delete</Button>
            </div>
          </ResizablePanel>

        </Layout.Top>
      </Layout.Container>

      <DetailSidebar width={500}>
        <DataTable columns={columns} dataSource={instance.eventLogs} enableAutoScroll></DataTable>
      </DetailSidebar>

    </Layout.Container>
  );
}

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

const LargeHeading = styled.div({
  fontSize: 18,
  fontWeight: 'bold',
  lineHeight: '20px',
  borderBottom: '1px solid #ddd',
  marginBottom: 10,
});

const SmallHeading = styled.div({
  fontSize: 12,
  color: '#90949c',
  fontWeight: 'bold',
  marginBottom: 10,
  textTransform: 'uppercase',
});
