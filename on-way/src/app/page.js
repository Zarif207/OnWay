import HomeClientEffects from "./components/Home/HomeClientEffects";
import Hero from "./components/Home/Hero";
import Stats from "./components/Home/Stats";
import Platform from "./components/Home/Platform";
import Safety from "./components/Home/Safety";
import Earn from "./components/Home/Earn";
import Contact from "./components/Home/Contact";
import ScrollProgress from "./components/ScrollProgress";
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
        <Earn />
        <Contact />
      </main>
    </ScrollProgress>
  );
}
