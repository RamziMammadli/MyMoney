import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemedColors() {
  const { colorScheme } = useTheme();
  return Colors[colorScheme];
}
