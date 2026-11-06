import Scene from "@/components/SceneLoader";
import Smooth from "@/components/Smooth";
import Site from "@/components/Site";
import Intro from "@/components/Intro";

export default function Home() {
  return (
    <>
      <Intro />
      <Smooth />
      <Scene />
      <Site />
    </>
  );
}
