export const QUIZ_QUESTION =
  "What is one honest work you have done that paid off?";

export type Participant = {
  id: string;
  name: string;
  phone: string;
  answer: string | null;
  registeredAt: string;
  answeredAt: string | null;
};
