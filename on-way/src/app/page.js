import HomeClientEffects from "./components/Home/HomeClientEffects";
import Hero from "./components/Home/Hero";
import Stats from "./components/Home/Stats";
import Platform from "./components/Home/Platform";
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

      </main>
    </>
  );
}
