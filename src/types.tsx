import React from 'react';

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

  export {
    EventLog,
    Size,
    TouchPhase,
    TouchEvent,
    KeyEvent
}
