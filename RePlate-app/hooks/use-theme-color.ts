import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeColorKey = 'background' | 'text' | 'icon';

const themeColors = {
  light: {
    background: Colors.brand.bg,
    text: Colors.neutral.main,
    icon: Colors.neutral.muted,
  },
  dark: {
    background: Colors.brand.forest,
    text: Colors.neutral.white,
    icon: Colors.brand.sage,
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorKey
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return themeColors[theme][colorName];
}
