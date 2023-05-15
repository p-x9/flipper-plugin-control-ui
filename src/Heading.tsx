import React from 'react';

import {
    styled
} from 'flipper-plugin';

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

interface HeadingProps {
    /**
     * Level of the heading. A number from 1-6. Where 1 is the largest heading.
     */
    level?: number;
    /**
     * Children.
     */
    children?: React.ReactNode;
    style?: React.CSSProperties;
  }

export default function Heading(props: HeadingProps) {
    if (props.level === 1) {
        return <LargeHeading style={props.style}>{props.children}</LargeHeading>;
    } else {
        return <SmallHeading style={props.style}>{props.children}</SmallHeading>;
    }
}
