import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Guía de Usuario',
      collapsed: false,
      items: [
        'user/getting-started',
        'user/dashboard-guide',
        'user/features',
        'user/catalogs-guide',
        'user/admin-guide',
        'user/faq',
      ],
    },
    {
      type: 'category',
      label: 'Documentación Técnica',
      collapsed: false,
      items: [
        'it/overview',
        'it/installation',
        'it/architecture',
        'it/multi-site-architecture',
        'it/rbac',
        'it/hardware-catalogs',
        'it/compatibility-system',
        'it/excel-import-export',
        'it/error-handling',
        'it/concurrency-control',
        'it/ui-patterns',
        'it/troubleshooting',
        'it/api-reference',
      ],
    },
  ],
};

export default sidebars;
