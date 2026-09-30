import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export interface IconProps {
  readonly size?: number;
  readonly color?: string;
}

export const ShieldCheckIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#00C853',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5L4.5 5.8V11.4C4.5 16.5 7.7 21.1 12 22.5C16.3 21.1 19.5 16.5 19.5 11.4V5.8L12 2.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.8 12.2L11 14.4L15.4 9.8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const WifiSignalIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#38BDF8',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.5 9.5C7.8 4.8 16.2 4.8 21.5 9.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M5.8 13.2C9.3 10.1 14.7 10.1 18.2 13.2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M9.2 16.8C10.8 15.4 13.2 15.4 14.8 16.8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="20" r="1.5" fill={color} />
  </Svg>
);

export const GlobeLinkIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#00C853',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <Path d="M3.5 12H20.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path
      d="M12 3C14.5 5.6 15.8 8.7 15.8 12C15.8 15.3 14.5 18.4 12 21C9.5 18.4 8.2 15.3 8.2 12C8.2 8.7 9.5 5.6 12 3Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const QrMatrixIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#FFAB00',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
    <Rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
    <Rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
    <Rect x="14" y="14" width="3" height="3" rx="0.6" fill={color} />
    <Rect x="18" y="14" width="2.5" height="2.5" rx="0.5" fill={color} />
    <Rect x="14" y="18" width="2.5" height="2.5" rx="0.5" fill={color} />
    <Rect x="17.5" y="17.5" width="3" height="3" rx="0.6" fill={color} />
  </Svg>
);

export const LockSlidersIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#F43F5E',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="4.5"
      y="10.5"
      width="15"
      height="10"
      rx="2.5"
      stroke={color}
      strokeWidth={2}
    />
    <Path
      d="M8 10.5V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="15.5" r="1.6" fill={color} />
  </Svg>
);

export const BulbSparkIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#38BDF8',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18H15M10 21H14M12 3C8.7 3 6 5.7 6 9C6 11.2 7.2 13.1 9 14.1V15.5C9 16.1 9.4 16.5 10 16.5H14C14.6 16.5 15 16.1 15 15.5V14.1C16.8 13.1 18 11.2 18 9C18 5.7 15.3 3 12 3Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#64748B',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6L15 12L9 18"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
