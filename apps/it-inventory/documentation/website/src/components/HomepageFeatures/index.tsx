import React, { JSX } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Gestión Completa de Activos',
    icon: '📦',
    description: (
      <>
        Control total de tu inventario IT: laptops, desktops, móviles, tablets,
        servidores y más. Toda la información centralizada en un solo lugar.
      </>
    ),
  },
  {
    title: 'Control de Asignaciones',
    icon: '👥',
    description: (
      <>
        Sabe en todo momento quién tiene qué equipo. Registra asignaciones,
        devoluciones y mantén un historial completo de movimientos.
      </>
    ),
  },
  {
    title: 'Seguridad y Roles',
    icon: '🔐',
    description: (
      <>
        Sistema de autenticación JWT con control de acceso basado en roles.
        Tres niveles: Admin, IT y Viewer.
      </>
    ),
  },
  {
    title: 'Reportes y Estadísticas',
    icon: '📊',
    description: (
      <>
        Genera reportes detallados, exporta a Excel, controla garantías
        y obtén información clara sobre tu inventario.
      </>
    ),
  },
  {
    title: 'Interfaz Intuitiva',
    icon: '✨',
    description: (
      <>
        Diseñada con React y TailwindCSS. Experiencia de usuario moderna,
        responsive y fácil de usar.
      </>
    ),
  },
  {
    title: 'API REST Completa',
    icon: '🚀',
    description: (
      <>
        Backend potente con Node.js, Express y PostgreSQL. API REST
        documentada lista para integraciones.
      </>
    ),
  },
];

function Feature({title, description, icon}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
