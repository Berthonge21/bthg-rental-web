import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    // Primary Blue - Deep royal blue
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    // Mauve/Purple accent
    mauve: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    // Ocean blue gradient colors
    ocean: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    // Background colors
    surface: {
      light: '#f8fafc',
      dark: '#0f172a',
    },
    // Glass effect colors
    glass: {
      light: 'rgba(255, 255, 255, 0.8)',
      dark: 'rgba(15, 23, 42, 0.8)',
    },
  },
  fonts: {
    heading: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'surface.dark' : 'surface.light',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
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
        borderRadius: 'xl',
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: props.colorScheme === 'brand'
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)'
            : undefined,
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            bg: props.colorScheme === 'brand'
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)'
              : undefined,
          },
          _active: {
            transform: 'translateY(0)',
          },
        }),
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
        ghost: {
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
    Card: {
      baseStyle: (props: { colorMode: string }) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderRadius: '2xl',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        },
      }),
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
      variants: {
        filled: {
          field: {
            borderRadius: 'xl',
            _focus: {
              borderColor: 'brand.500',
            },
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
        fontWeight: '600',
      },
    },
    Menu: {
      baseStyle: {
        list: {
          borderRadius: 'xl',
          border: 'none',
          boxShadow: 'xl',
          p: 2,
        },
        item: {
          borderRadius: 'lg',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
    Table: {
      variants: {
        modern: {
          table: {
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
          },
          th: {
            border: 'none',
            fontWeight: '600',
            textTransform: 'none',
            letterSpacing: 'normal',
            color: 'gray.500',
            fontSize: 'sm',
            py: 3,
          },
          td: {
            border: 'none',
            py: 4,
            px: 4,
          },
          tr: {
            bg: 'white',
            borderRadius: 'xl',
            boxShadow: 'sm',
            _hover: {
              boxShadow: 'md',
            },
          },
        },
      },
    },
  },
  layerStyles: {
    glass: {
      bg: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '2xl',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    glassDark: {
      bg: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '2xl',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    gradientCard: {
      bgGradient: 'linear(135deg, brand.500, mauve.500)',
      borderRadius: '2xl',
      color: 'white',
    },
  },
  shadows: {
    glow: '0 0 40px rgba(99, 102, 241, 0.3)',
    glowMauve: '0 0 40px rgba(217, 70, 239, 0.3)',
  },
});
