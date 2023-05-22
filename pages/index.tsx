import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { Inter } from 'next/font/google'
import { Title, Grid, Col, Paper, Text, Center, Space, Flex, Button } from '@mantine/core'
import LoginCard from '../components/LoginCard'
import SignupCard from '../components/SignupCard'


const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div>
      <Head>
        <title>FitAI</title>
        <meta name="description" content="A simple fitness plan app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Grid>
          <Col span={12}>
            <Paper className={styles.logoWrapper} style={{ backgroundColor: 'transparent' }}>
              <img src="/logo.png" alt="Logo" className={styles.logo} onClick={(e) => { e.preventDefault(); window.location.reload(); }} />
            </Paper>
          </Col>
      </Grid>

      
        <img src="running.png" className={styles.bg}/>
        <Center h={400} className={styles.container}>
          <Flex direction="column">
            <Title align="center" order={1}>Elevating Fitness with ChatGPT</Title>
            <Text align='center' size="sm" color="#94a1b2">FitAI leverages the power of ChatGPT to deliver personalized workout 
                routines and meal preps tailored to your goals and preferences.
            </Text>
            <Space h="sm"/>
            <Flex direction='row' align='center' justify="center" gap="md">
              <LoginCard />
              <SignupCard />
            </Flex>
          </Flex>
        </Center>
    </div>
  )
}