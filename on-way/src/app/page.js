import HomeClientEffects from "./root-components/Home/HomeClientEffects";
import Hero from "./root-components/Home/Hero";
import Stats from "./root-components/Home/Stats";
import Platform from "./root-components/Home/Platform";
import Safety from "./root-components/Home/Safety";
import Earn from "./root-components/Home/Earn";
import Contact from "./root-components/Home/Contact";
export default function Home() {
  return (
    <>
      <HomeClientEffects />
      <main>
        <Hero />
        <div className="pb-10">
          <Stats />
        </div>
        <Platform></Platform>
        <Safety></Safety>
        <Earn></Earn>
        <Contact></Contact>
      </main>
    </>
  );
}
