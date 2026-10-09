export type JourneyStep = {
  key: string;
  title: string;
  desc: string;
};

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: "explore",
    title: "Explore",
    desc: "Live job listings from connected employers.",
  },
  {
    key: "search",
    title: "Search",
    desc: "By role, company, category, and location.",
  },
  {
    key: "apply",
    title: "Apply",
    desc: "To multiple listings with your StellarNext profile.",
  },
  {
    key: "track",
    title: "Track",
    desc: "Your applications inside the platform.",
  },
  {
    key: "get",
    title: "Get noticed",
    desc: "See application status updates in your dashboard.",
  },
  {
    key: "build",
    title: "Build",
    desc: "Keep your experience, education, and skills current.",
  },
];
