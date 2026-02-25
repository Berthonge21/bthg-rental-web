import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      'text.primary': {
        default: '#1a202c',
        _dark: '#FFFFFF',
      },
      'text.secondary': {
        default: '#4a5568',
        _dark: '#A0AEC0',
      },
      'text.muted': {
        default: '#718096',
        _dark: '#718096',
      },
    },
  },
  colors: {
    // Primary Gold - for buttons and accents
    brand: {
      50: '#fff9db',
      100: '#fff3b0',
      200: '#ffec80',
      300: '#ffe44d',
      400: '#FFD700', // Primary gold
      500: '#e6c200',
      600: '#b89b00',
      700: '#8a7400',
      800: '#5c4d00',
      900: '#2e2700',
    },
    // Dark Green - for secondary highlights
    accent: {
      50: '#e6f0ea',
      100: '#b3d4c0',
      200: '#80b896',
      300: '#4d9c6c',
      400: '#014421', // Dark green
      500: '#013a1c',
      600: '#012f17',
      700: '#012512',
      800: '#001a0c',
      900: '#001007',
    },
    // Black scale - for sidebar and dark elements
    navy: {
      50: '#e6e6e6',
      100: '#b3b3b3',
      200: '#808080',
      300: '#4d4d4d',
      400: '#333333',
      500: '#1a1a1a',
      600: '#141414',
      700: '#080808',
      800: '#000000', // Pure black
      900: '#000000',
    },
    // Light Gold
    lightGold: {
      50: '#fffbeb',
      100: '#fff5cc',
      200: '#ffefaa',
      300: '#ffe899',
      400: '#FFE082', // Light gold
      500: '#e6ca75',
      600: '#ccb368',
      700: '#b39d5b',
      800: '#99864e',
      900: '#806f41',
    },
    // Surface colors
    surface: {
      light: '#F9FAFB',
      dark: '#000000',
      card: '#080808',
    },
  },
  fonts: {
    heading: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#000000' : 'surface.light',
        color: props.colorMode === 'dark' ? 'white' : 'text.primary',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: props.colorScheme === 'brand' ? 'brand.400' : undefined,
          color: props.colorScheme === 'brand' ? '#000000' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'lightGold.400' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            transform: 'translateY(0)',
          },
        }),
        accent: {
          bg: 'accent.400',
          color: 'white',
          _hover: {
            bg: 'accent.500',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
        },
        ghost: (props: { colorMode: string }) => ({
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(255,215,0,0.08)' : 'gray.100',
          },
        }),
        outline: (props: { colorMode: string }) => ({
          borderColor: 'brand.400',
          color: 'brand.400',
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(255,215,0,0.08)' : 'brand.50',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: { colorMode: string }) => ({
        container: {
          bg: props.colorMode === 'dark' ? '#080808' : 'white',
          borderRadius: 'xl',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'rgba(255,215,0,0.1)' : 'gray.100',
        },
      }),
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
      variants: {
        filled: (props: { colorMode: string }) => ({
          field: {
            borderRadius: 'lg',
            bg: props.colorMode === 'dark' ? '#080808' : 'gray.50',
            border: '1px solid',
            borderColor: props.colorMode === 'dark' ? 'rgba(255,215,0,0.1)' : 'transparent',
            _hover: { bg: props.colorMode === 'dark' ? '#111' : 'gray.100' },
            _focus: {
              bg: props.colorMode === 'dark' ? '#0a0a0a' : 'white',
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px #FFD700',
            },
          },
        }),
        outline: (props: { colorMode: string }) => ({
          field: {
            borderRadius: 'lg',
            borderColor: props.colorMode === 'dark' ? 'rgba(255,215,0,0.15)' : 'gray.200',
            _focus: {
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px #FFD700',
            },
          },
        }),
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'md',
        px: 2,
        py: 0.5,
        fontWeight: '600',
        fontSize: 'xs',
      },
    },
    Menu: {
      baseStyle: (props: { colorMode: string }) => ({
        list: {
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'rgba(255,215,0,0.1)' : 'gray.100',
          bg: props.colorMode === 'dark' ? '#080808' : 'white',
          boxShadow: 'lg',
          p: 1,
        },
        item: {
          borderRadius: 'md',
          fontSize: 'sm',
          bg: props.colorMode === 'dark' ? '#080808' : 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(255,215,0,0.08)' : 'gray.50',
          },
        },
      }),
    },
    Table: {
      variants: {
        modern: {
          table: {
            borderCollapse: 'separate',
            borderSpacing: '0 4px',
          },
          th: {
            border: 'none',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'text.muted',
            fontSize: 'xs',
            py: 3,
            px: 4,
          },
          td: {
            border: 'none',
            py: 4,
            px: 4,
            _first: {
              borderLeftRadius: 'lg',
            },
            _last: {
              borderRightRadius: 'lg',
            },
          },
          tr: {
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    Tabs: {
      variants: {
        soft: {
          tab: {
            borderRadius: 'lg',
            fontWeight: '500',
            color: 'text.muted',
            _selected: {
              color: '#000000',
              bg: 'brand.400',
            },
          },
        },
      },
    },
  },
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
    soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
});
