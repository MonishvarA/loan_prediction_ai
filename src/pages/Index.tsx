import Hero from "@/components/Hero";
import LoanPredictForm from "@/components/LoanPredictForm";

const Index = () => {
  return (
    <main>
      <Hero />
      <section className="container mx-auto grid gap-8 py-10 md:py-14">
        <LoanPredictForm />
      </section>
    </main>
  );
};

export default Index;
