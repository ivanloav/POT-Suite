import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'IT Inventory',
  tagline: 'Sistema de Gestión de Inventario IT',

  future: {
    v4: true,
  },

  url: 'https://ivanloav.github.io',
  baseUrl: '/IT-Inventory-POT/',

  organizationName: 'ivanloav',
  projectName: 'IT-Inventory-POT',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    localeConfigs: {
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es-ES',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/ivanloav/IT-Inventory-POT/tree/main/',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'IT Inventory',
      logo: {
        alt: 'IT Inventory Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/ivanloav/IT-Inventory-POT',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            {
              label: 'Inicio',
              to: '/',
            },
            {
              label: 'Guía de Usuario',
              to: '/user/getting-started',
            },
            {
              label: 'Documentación Técnica',
              to: '/it/installation',
            },
          ],
        },
        {
          title: 'Enlaces',
          items: [
            {
              label: 'Repositorio GitHub',
              href: 'https://github.com/ivanloav/IT-Inventory-POT',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} IT Inventory. Sistema de Gestión de Inventario IT.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
