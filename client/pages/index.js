import { useCallback, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Layout from '../components/layout';
import { getSortedStepsData } from '../lib/steps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/router'
import { faBook, faChartArea } from '@fortawesome/free-solid-svg-icons'
import { motion } from "framer-motion"
import { API_URL } from "../constants";

export async function getStaticProps() {
  const allStepsData = getSortedStepsData()
  return {
    props: {
      allStepsData
    }
  }
}

export default function Home({ allStepsData }) {

  const onDropAccepted = useCallback(files => {
    setError('');

    setSelectedFiles(old => {
      const oldNames = old.map(e => e.path)
      const fileNames = files.map(e => e.path)
      const duplicate = oldNames.filter(x => fileNames.includes(x));
      if (duplicate.length > 0) {
        setError('Plik został już został dodany')
        return [...old]
      }
      return [...old, ...files]
    });
  }, [])

  const onDropRejected = useCallback(() => {
    setError('Niepoprawny format pliku! Wybierz plik w formacie .pdf.')
  }, [])

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDropAccepted, onDropRejected, accept: '.pdf' })
  const files = selectedFiles.map(file => <li key={file.path}>{file.path}</li>);
  const [error, setError] = useState('');
  const router = useRouter()

  const sendFiles = () => {
    setError('')
    if (selectedFiles.length > 1) {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files[]', file));
      setLoading(true);
      fetch(API_URL,
        {
          method: 'POST',
          body: formData,
        }).then(response => {
          return response.json()
        }
        ).then(data => {
          const { error } = data;
          if (error) {
            setError(error)
          } else {
            const { request_id } = data;
            router.push(`/activities/${request_id}`);
          }
        }
        ).catch(() => {
          setError(`Błąd aplikacji, spróbuj ponownie później`);
        }).finally(() => setLoading(false))

    } else {
      setError('Musisz wybrać co najmniej 2 pliki')
    }
  }

  const clearFiles = () => {
    setError('')
    setSelectedFiles([])
  }


  return (
    <div className={styles.container}>
      <Layout home>
        <Head>
          <title>Home | pitkalkulator </title>
          <meta property="og:title" content="Jak obliczyć PIT lub przychód z Revoluta?" />
          <meta property="og:description" content="Inwestujesz na giełdzie Revoluta? Dobrze trafiłeś, 
          dzęki aplikacji PIT Kalkulator obliczysz przychód z giełdy, dzięki temu z łatwością wypełnisz PIT-38 albo sprawdzisz ile zarobiłeś" />
          <meta property="og:image" content="https://pitkalkulator.pl/static/img/home.jpg" />
          <meta property="og:url" content="https://pitkalkulator.pl/" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="PIT Kalkulator" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="PIT Kalkulator" />
          <meta name="twitter:description" content="PIT Kalkulator pozwoli Ci obliczyć ile zarobiłeś na giełdzie Revolut, co ułatwi Ci wypełnienie PIT-38. 
          Dodatkowo nie musisz się martwić o przeliczenie na PLN, pomyśleliśmy też o tym, więcej informacji znajdziesz w sekcji FAQ" />
          <meta name="twitter:image" content="https://pitkalkulator.pl/static/img/home.jpg" />
          <meta name="description" content="PIT Kalkulator pozwoli Ci obliczyć ile zarobiłeś na giełdzie Revolut, co ułatwi Ci wypełnienie PIT-38. 
          Dodatkowo nie musisz się martwić o przeliczenie na PLN, pomyśleliśmy też o tym, więcej informacji znajdziesz w sekcji FAQ" />
          <meta name="keywords" content="Revolut PIT, Revolut jak obliczy pit?, Revolut PIT-8C, Jak obliczyć zysk na revolucie?, Jak sprawdzić 
          ile zarobiłem na revolucie?, revolut giełda zysk, revolut giełda pit, revolut pit"></meta>
        </Head>
        {loading ? <div className={styles.loader}>Loading...</div> : <div></div>}
        <div className={styles.dropWraper}>
          <div className={styles.dropContent}>
            <h2 className={styles.stepCardTitle}><FontAwesomeIcon icon={faChartArea} />&nbsp;Oblicz zysk</h2>
            <p>Wybierz rachunki</p>
            <p className={styles.textMuted}>Maksymalny rozmiar 16MB</p>
            <p className={styles.textWarning}>{error}</p>
            <div className={isDragActive ? styles.dragZoneActive : styles.dragZone} {...getRootProps()}>
              <input {...getInputProps()} />
              <>
                {isDragActive ?
                  <p className={styles.dragZoneText}>Upuść plik...</p> :
                  <p className={styles.dragZoneText}>Przeciągnij plik tutaj albo kliknij, aby je wybrać (format .pdf)</p>}
                <ul>{files}</ul>
              </>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.clearButton} onClick={() => clearFiles()}>Wyczyść</button>
              <button className={styles.sendButton} onClick={() => sendFiles()}>Wyślij</button>
            </div>
            <p className={styles.regulations}>Klikając przycisk "Wyślij" akceptujesz <a href='/regulations'>regulamin serwisu</a></p>

            <p style={{ textAlign: 'center' }}>Przekaż darowiznę na utrzymanie serwera</p>
            <div className={styles.buttonContainer}>
              <form action="https://www.paypal.com/donate" method="post" target="_top">
                <input type="hidden" name="hosted_button_id" value="V7ED6TBBY8USQ" />
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                <img alt="" border="0" src="https://www.paypal.com/en_PL/i/scr/pixel.gif" width="1" height="1" />
              </form>
            </div>
          </div>
        </div>
        <div className={styles.stepCardLayout}>
          <h2 className={styles.stepCardTitle}><FontAwesomeIcon icon={faBook} />&nbsp;Instrukcja</h2>

          {
            allStepsData.map(step => (
              <div key={step.id} className={styles.stepCard}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={styles.stepContent}>
                  <h3>{step.title}</h3>
                  <div className={styles.stepText}>
                    <p>{step.content}</p>
                    <p className={styles.textWarning}>{step.warning}</p>
                  </div>
                  <div className={styles.stepImg}>
                    <img
                      height="350px"
                      src={"/images/" + step.img}
                      alt={step.title}
                    />
                  </div>
                </motion.div>
              </div>
            ))
          }
        </div>
      </Layout>
    </div>
  )
}
