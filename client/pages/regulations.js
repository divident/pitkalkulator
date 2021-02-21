import Head from 'next/head'
import Layout from '../components/layout';
import styles from '../styles/Home.module.css'


export default function Regulations() {
    const regulationsStyle =  {
        maxWidth: '500px',
        textAlign: 'left',
        margin: '0 auto'
    }

    return (
        <Layout>
            <Head>
                <meta property="og:title" content="PIT Kalkulator Regulamin" />
                <meta property="og:description" content="Regulamin serwisu pitkalkulator.pl" />
                <meta property="og:image" content="https://pitkalkulator.pl/static/img/faq.jpg" />
                <meta property="og:url" content="https://pitkalkulator.pl/regulations" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="PIT Kalkulator" />

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="PIT Kalkulator Regulamin" />
                <meta name="twitter:description" content="Regulamin serwisu pitkalkulator.pl" />
                <meta name="twitter:image" content="https://pitkalkulator.pl/static/img/faq.jpg" />

                <meta name="description" content="Regulamin serwisu pitkalkulator.pl" />
                <meta name="keywords" content="Regulamin serwisu pitkalkulator.pl,Regulamin" />
                <title>Regulamin | pitkalkulator </title>
            </Head>
            <div className={styles.cardLayout} style={regulationsStyle}>
                <h3>Regulamin serwisu pitkalkulator.pl</h3>
                <h4>Definicje</h4>
                <ol>
                    <li>Użytkownik - osoba korzystjąca z serwisu pitkalkulator.pl</li>
                    <li>Raport - plik w formacie pdf zawierający informacje o transakcjach giełdowych</li>
                    <li>Serwis pitkalkulator.pl - aplikacja interneowa prowadzona w domenie pitkalkulator.pl przez firmę Piotr Chmielewski, 
                        będąca narzędziem umożliwiającym obliczenie zysków kapitałowych. Użytkownik może się skontakować z firmą przez adres e-mail pchmielewski.projects(at)gmail.com </li>
                </ol>
                <h4>Zasady generowania raportu o zyskach kapitałowych</h4>
                <ol>
                    <li>Podstawą do obliczenia zysków kapitałowych, jest dostarczony przez Użytkownika Raport</li>
                    <li>Z Raportu pobierane są informację o dokonanych transakcji zakupu i sprzedaży akcji, w celu obliczenia dochodu</li>
                    <li>Wysłany raport jest następnie usuwany z Serwisu pitkalkulator.pl</li>
                    <li>Na podstawie danych zostaje wygenerowane dla Użytkownika, zestawienie dokonanych transkacji, a także obliczony koszt uzyskania przychodu, przychód i dochód</li>
                    <li>Zestawienie przechowywane jest w postaci zanonimizowanej, uniemożliwiającej powiązanie konkretnej osoby z listą transakcji</li>
                    <li>Dostęp do listy transakcji jest możliwy wyłącznie przy znajomości losowo wygenerowanego identyfikatora</li>
                    <li>Jeżeli waluta rozliczeniowa transakcji, jest inna niż PLN, kurs jest pobierany z NBP API, z ostatniego dnia roboczego poprzedzającego transakcję</li>
                </ol>
                <h4>Rola operatora Serwisu pitkalkulator.pl</h4>
                <ol>
                    <li>W ramach Serwisu pitkalkulator.pl, udostępnione zostaje użytkownikom narzędzie umożliwiające  automatyczne przetworzenie i obliczenie zysków kapitałowych, na podstawie dostarczonych Raportów</li>
                    <li>Operator nie ponosi odpowiedzialności za działania Użytkowników w ramach Serwisu pitkalkulator.pl, ani za treść wszelkich danych zamieszczanych przez Użytkowników serwisu pitkalkulator.pl</li>
                    <li>Operator zrzeka się odpowiedzialności za poprawność wyliczeń wartości kosztu uzyskania przychodu, przychodu oraz dochodu</li>
                </ol>
            </div>
        </Layout>
    )
}
