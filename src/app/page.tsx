import { QuizExperience } from "@/components/quiz-experience";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[radial-gradient(circle_at_top,_oklch(0.98_0.03_280),_transparent_58%),radial-gradient(circle_at_bottom,_oklch(0.97_0.03_200),_transparent_55%)]">
      <QuizExperience />
    </div>
  );
}
