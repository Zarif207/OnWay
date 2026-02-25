import HomeClientEffects from "./components/Home/HomeClientEffects";
import Hero from "./components/Home/Hero";
import Stats from "./components/Home/Stats";
import Platform from "./components/Home/Platform";
import Safety from "./components/Home/Safety";
import Earn from "./components/Home/Earn";
import Contact from "./components/Home/Contact";
import ScrollProgress from "./components/ScrollProgress";
import HowItWorks from "./components/Home/HowItWorks";
import Testimonials from "./components/Home/Testimonials";
export default function Home() {
  return (
    <ScrollProgress>
      <HomeClientEffects />
      <main>
        <Hero />
        <div className="pb-10">
          <Stats />
        </div>
        <Platform />
        <Safety />
        <HowItWorks />
        <Earn />
        <Testimonials />
        <Contact />
      </main>
    </ScrollProgress>
  );
}
