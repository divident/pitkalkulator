import Head from 'next/head'
import Layout from '../components/layout';
import { getSortedQuestionsData } from '../lib/questions'
import styles from '../styles/Home.module.css'
import { motion } from "framer-motion"


export async function getStaticProps() {
    const allQuestionsData = getSortedQuestionsData()
    return {
        props: {
            allQuestionsData
        }
    }
}

export default function Faq({ allQuestionsData }) {
    return (
        <Layout>
            <Head>
                <meta property="og:title" content="PIT Kalkulator FAQ" />
                <meta property="og:description" content="Masz pytania dotyczące działania PIT Kalkulator? Chesz 
                się dowiedzieć jak liczony jest przychód lub w jaki spsób przeliczane są obce waluty na PLN? Sprawdź nasz dział FAQ" />
                <meta property="og:image" content="https://pitkalkulator.pl/static/img/faq.jpg" />
                <meta property="og:url" content="https://pitkalkulator.pl/faq" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="PIT Kalkulator" />

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="PIT Kalkulator FAQ" />
                <meta name="twitter:description" content="Masz pytania dotyczące działania PIT Kalkulator? Chesz 
                się dowiedzieć jak liczony jest przychód lub w jaki spsób przeliczane są obce waluty na PLN? Sprawdź nasz dział FAQ" />
                <meta name="twitter:image" content="https://pitkalkulator.pl/static/img/faq.jpg" />

                <meta name="description" content="Masz pytania dotyczące działania PIT Kalkulator? Chesz się dowiedzieć jak liczony jest przychód lub w jaki spsób przeliczane są obce waluty na PLN? Sprawdź nasz dział FAQ" />
                <meta name="keywords" content="Jak liczony jest przychód w PIT kalkulator?, Czy przyhód jest w PLN?, Jak działa kalkulator? PIT kalkulator błąd" />
                <title>FAQ | pitkalkulator </title>
            </Head>
            <div className={styles.cardLayout}>
                {allQuestionsData.map(question => (
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        key={question.id} className={styles.card}>
                        <div style={{ maxWidth: "500px" }}>
                            <h3>{question.title}</h3>
                            <div dangerouslySetInnerHTML={{ __html: question.content }}></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Layout>
    )
}
