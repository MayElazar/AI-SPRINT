import drBruckheimer from "../assets/dr-cohen.png";
import yael from "../assets/yael.png";
import galit from "../assets/galit.png";

const NURSE_SVG = (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#F0D6BE" />
    <path
      d="M15 100 C15 72 30 60 50 60 C70 60 85 72 85 100 Z"
      fill="var(--teal)"
    />
    <circle cx="50" cy="42" r="22" fill="#F0D6BE" />
    <path
      d="M30 34 C30 22 70 22 70 34 C70 30 62 27 50 27 C38 27 30 30 30 34 Z"
      fill="#5A3A28"
    />
    <circle cx="41" cy="44" r="2.4" fill="#2A1E14" />
    <circle cx="59" cy="44" r="2.4" fill="#2A1E14" />
  </svg>
);

// Generic "whole team" mark, used for the Meet the Team step, which
// introduces Dr. Bruckheimer, Yael, and Galit together rather than one person.
const TEAM_SVG = (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="var(--accent-tint)" />
    <circle cx="35" cy="46" r="14" fill="var(--surface)" stroke="var(--accent-deep)" strokeWidth="2.5" />
    <circle cx="65" cy="46" r="14" fill="var(--surface)" stroke="var(--teal)" strokeWidth="2.5" />
    <path
      d="M18 82c2-12 9-19 17-19s15 7 17 19"
      fill="none"
      stroke="var(--accent-deep)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M48 82c2-12 9-19 17-19s15 7 17 19"
      fill="none"
      stroke="var(--teal)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// Hospital tour mark: a simple map pin over a floor-plan corner,
// standing in for "walk the unit" before a real photo/illustration
// exists for it.
const TOUR_SVG = (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="var(--cyan-tint)" />
    <path
      d="M28 66V34h34v18H50v14z"
      fill="none"
      stroke="var(--cyan-tint-text)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="66" cy="56" r="12" fill="var(--surface)" stroke="var(--cyan-tint-text)" strokeWidth="2.5" />
    <circle cx="66" cy="53.5" r="3" fill="var(--cyan-tint-text)" />
    <path d="M66 56.5c-3.5 0-5 2.2-5 4.5h10c0-2.3-1.5-4.5-5-4.5z" fill="var(--cyan-tint-text)" />
  </svg>
);

// avatarKind: "doctor" | "yael" | "galit" | "nurse" | "team" | "tour".
// Dr. Bruckheimer, Yael, and Galit all have real reference photos now;
// "nurse" stays as a generic illustrated fallback for any unnamed staff.
export default function Avatar({ kind, alt }) {
  if (kind === "doctor") {
    return <img src={drBruckheimer} alt={alt || "Dr. Bruckheimer"} />;
  }
  if (kind === "yael") {
    return <img src={yael} alt={alt || "Yael"} />;
  }
  if (kind === "galit") {
    return <img src={galit} alt={alt || "Galit"} />;
  }
  if (kind === "team") {
    return TEAM_SVG;
  }
  if (kind === "tour") {
    return TOUR_SVG;
  }
  return NURSE_SVG;
}
