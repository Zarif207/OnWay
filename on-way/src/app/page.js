import HomeClientEffects from "./components/Home/HomeClientEffects";
import Hero from "./components/Home/Hero";
import Stats from "./components/Home/Stats";
import Platform from "./components/Home/Platform";
import Safety from "./components/Home/Safety";
import Earn from "./components/Home/Earn";
import Contact from "./components/Home/Contact";
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
