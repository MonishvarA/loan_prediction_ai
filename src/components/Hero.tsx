import heroImage from "@/assets/hero-loan.jpg";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={heroImage} alt="Abstract fintech gradient background for Loan Approval AI" className="h-full w-full object-cover" loading="eager" />
      </div>
      <div className="container mx-auto py-20 md:py-28">
        <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl" id="page-title">
            Loan Approval AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Train a privacy-friendly model in your browser using a real dataset and get instant approval predictions with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <a href="#predict">Try Prediction</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#train">Train Model</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
