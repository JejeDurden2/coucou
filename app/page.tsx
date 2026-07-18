import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Guarantee } from "@/components/sections/guarantee";
import { Hero } from "@/components/sections/hero";
import { Method } from "@/components/sections/method";
import { Problem } from "@/components/sections/problem";
import { Services } from "@/components/sections/services";
import { UseCases } from "@/components/sections/use-cases";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Services />
      <Method />
      <UseCases />
      <Guarantee />
      <Faq />
      <Cta />
    </main>
  );
}
