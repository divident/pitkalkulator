import Head from 'next/head'
import Layout from '../components/layout';


export default function Activities() {
  return (
      <Layout>
      <Head>
        <title>Activities | pitkalkulator </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <img 
          src="/images/step_2.jpg"
          alt="Step 2"
        />
      </div>
      </Layout>
  )
}
