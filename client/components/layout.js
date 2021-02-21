import Head from 'next/head'
import styles from './layout.module.css'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faCalculator } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons'
import Cookies from './cookies'

export const siteTitle = 'Next.js Sample Website'

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta property="fb:app_id" content="673341599948411" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-177371040-1"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              gtag('js', new Date());
      
              gtag('config', 'UA-177371040-1');`
          }}
        />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href='/'>
            <h2 className={styles.logo}><FontAwesomeIcon className={styles.logoIcon} icon={faCalculator} />PITkalkulator</h2>
          </Link>
          <div className={styles.headerLinks}>
            <Link href='/faq'><a className={styles.headerLink}>FAQ</a></Link>
            <Link href='/activities/demo'><a className={styles.headerLink}>Demo</a></Link>

            <a href="https://www.facebook.com/PIT-Kalkulator-108185764358336">
              <FontAwesomeIcon className={styles.headerIcon} icon={faFacebook} />
            </a>
            <a href="https://github.com/divident/pitkalkulator">
              <FontAwesomeIcon className={styles.githubIcon} icon={faGithub} />
            </a>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Powrót na stronę główną</a>
          </Link>
        </div>
      )}
      <Cookies className={styles.cookies}></Cookies>
    </div>
  )
}