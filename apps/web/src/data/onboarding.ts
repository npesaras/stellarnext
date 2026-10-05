export const STEPS = [
  { key: "name", label: "Name" },
  { key: "location", label: "Location" },
  { key: "experience", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "skills", label: "Skills" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const YEARS = Array.from(
  { length: 60 },
  (_, i) => new Date().getFullYear() - i,
);
