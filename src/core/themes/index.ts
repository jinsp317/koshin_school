import {
  dark,
  light,
} from '@src/core/@eva-design/eva';
import { appTheme } from './appTheme';
import { ThemeType } from '@src/core/react-native-ui-kitten/theme';

interface ThemeRegistry {
  ['Eva Light']: ThemeType;
  ['Eva Dark']: ThemeType;
  ['App Theme']: ThemeType;
}

export type ThemeKey = keyof ThemeRegistry;

export const themes: ThemeRegistry = {
  'Eva Light': light,
  'Eva Dark': dark,
  'App Theme': appTheme,
};

export {
  ThemeContext,
  ThemeContextType,
} from './themeContext';

export { ThemeStore } from './theme.store';
export { ThemeService } from './theme.service';
