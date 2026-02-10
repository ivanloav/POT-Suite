import React, { JSX } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const logoUrl = useBaseUrl('/img/logo.png');
  
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroContent}>
          <img 
            src={logoUrl} 
            alt="IT Inventory Logo" 
            className={styles.heroLogo}
          />
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.heroDescription}>
            <p>
              Plataforma integral para la gestión de activos tecnológicos.
              Control total de equipos, asignaciones y reportes en tiempo real.
            </p>
          </div>
          <div className={styles.buttons}>
            <Link
              className={styles.buttonPrimary}
              to="/user/getting-started">
              Comenzar
            </Link>
            <Link
              className={styles.buttonSecondary}
              to="/it/overview">
              Ver Documentación Técnica
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Bienvenido`}
      description="Sistema de Gestión de Inventario IT - Documentación">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
