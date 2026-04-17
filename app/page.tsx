import Header   from '@/components/Header'
import Hero     from '@/components/Hero'
import About    from '@/components/About'
import Services from '@/components/Services'
import Steps    from '@/components/Steps'
import ChatBot  from '@/components/ChatBot'
import Footer   from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Steps />
        <ChatBot />
      </main>
      <Footer />
    </>
  )
}
