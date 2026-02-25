import ScrollProgress from "./components/ScrollProgress";
import Contact from "./root-components/Home/Contact";
import Earn from "./root-components/Home/Earn";
import Hero from "./root-components/Home/Hero";
import HomeClientEffects from "./root-components/Home/HomeClientEffects";
import Platform from "./root-components/Home/Platform";
import Safety from "./root-components/Home/Safety";
import Stats from "./root-components/Home/Stats";



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
