/*
 * Automotive brand colours (primary / dark-hover / near-black base).
 * Verified against public brand-colour references where possible; brands
 * marked "unverified" below have no publicly documented digital hex codes
 * and are a best-effort guess from the logo. Always eyeball the live preview
 * and adjust with the colour pickers before shipping to a client.
 */
const BRAND_COLOURS = [
  { name: "Alfa Romeo", primary: "#98102a", dark: "#6d0b1e", black: "#0a0a0a" },
  { name: "Audi", primary: "#bb0a30", dark: "#8a0722", black: "#0a0a0a" },
  { name: "BMW", primary: "#0066b1", dark: "#004a80", black: "#0a0a0a" },
  { name: "BYD", primary: "#e91b21", dark: "#a91217", black: "#0a0a0a" },
  { name: "Chery", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
  { name: "Chevrolet", primary: "#f1b51c", dark: "#c99400", black: "#0a0a0a" },
  { name: "Citroen", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
  { name: "Cupra", primary: "#a85c32", dark: "#7a4222", black: "#0a0a0a" }, // unverified - copper accent, no public digital hex
  { name: "Deepal", primary: "#0a4dab", dark: "#073876", black: "#0a0a0a" }, // unverified
  { name: "Fiat", primary: "#8b0304", dark: "#5e0203", black: "#0a0a0a" },
  { name: "Ford", primary: "#003478", dark: "#00234f", black: "#0a0a0a" },
  { name: "GAC", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" }, // unverified
  { name: "Genesis", primary: "#a99677", dark: "#8a7a5f", black: "#0a0a0a" },
  { name: "GWM", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" }, // unverified
  { name: "Haval", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" }, // unverified
  { name: "Holden", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
  { name: "Honda", primary: "#cc0000", dark: "#990000", black: "#0a0a0a" },
  { name: "Hyundai", primary: "#002c5f", dark: "#001c3d", black: "#0a0a0a" },
  { name: "Isuzu UTE", primary: "#e2231a", dark: "#a91a13", black: "#0a0a0a" },
  { name: "Jaecoo", primary: "#a9822f", dark: "#7c5f22", black: "#0a0a0a" }, // unverified
  { name: "Jaguar", primary: "#1b1b1b", dark: "#000000", black: "#0a0a0a" }, // unverified - 2024 rebrand still settling
  { name: "Jeep", primary: "#4a5d23", dark: "#333f18", black: "#0a0a0a" },
  { name: "Kia", primary: "#4a4a4a", dark: "#2b2b2b", black: "#0a0a0a" },
  { name: "Land Rover", primary: "#0b6836", dark: "#073d1f", black: "#0a0a0a" },
  { name: "LDV", primary: "#e2231a", dark: "#a91a13", black: "#0a0a0a" },
  { name: "Lexus", primary: "#1a1a1a", dark: "#000000", black: "#0a0a0a" },
  { name: "Mazda", primary: "#8b1d24", dark: "#5e1319", black: "#050505" }, // deep "Soul Red" tone - Mazda's actual corporate logo is black/white/silver, no single official web-red hex exists
  { name: "Mercedes-Benz", primary: "#000000", dark: "#1c1c1c", black: "#0a0a0a" },
  { name: "MG", primary: "#ff0000", dark: "#b30000", black: "#0a0a0a" },
  { name: "Mitsubishi", primary: "#e60012", dark: "#a8000d", black: "#0a0a0a" },
  { name: "Nissan", primary: "#c3002f", dark: "#8f0021", black: "#0a0a0a" },
  { name: "Omoda", primary: "#00a19a", dark: "#00706b", black: "#0a0a0a" }, // unverified
  { name: "Peugeot", primary: "#0a0a0a", dark: "#000000", black: "#0a0a0a" },
  { name: "Polestar", primary: "#0a0a0a", dark: "#000000", black: "#0a0a0a" },
  { name: "Porsche", primary: "#0a0a0a", dark: "#000000", black: "#0a0a0a" }, // unverified
  { name: "RAM", primary: "#1c1c1c", dark: "#000000", black: "#0a0a0a" },
  { name: "Renault", primary: "#ffcc00", dark: "#cc9900", black: "#0a0a0a" },
  { name: "Skoda", primary: "#4ba82e", dark: "#357a1f", black: "#0a0a0a" },
  { name: "SsangYong / KGM", primary: "#003764", dark: "#002343", black: "#0a0a0a" }, // unverified
  { name: "Subaru", primary: "#0033a0", dark: "#00246f", black: "#0a0a0a" },
  { name: "Suzuki", primary: "#e30016", dark: "#a8000f", black: "#0a0a0a" },
  { name: "Tesla", primary: "#cc0000", dark: "#990000", black: "#0a0a0a" },
  { name: "Volkswagen", primary: "#001e50", dark: "#001336", black: "#0a0a0a" },
  { name: "Volvo", primary: "#003057", dark: "#001f3a", black: "#0a0a0a" },
  { name: "XPeng", primary: "#a4ce4c", dark: "#7ba32e", black: "#0a0a0a" },
  { name: "Zeekr", primary: "#f76400", dark: "#c14e00", black: "#0a0a0a" },
];

function findBrandColours(name) {
  const match = BRAND_COLOURS.find(
    (b) => b.name.toLowerCase() === (name || "").trim().toLowerCase()
  );
  return match || { name: name || "Custom", primary: "#2f5bff", dark: "#2447d1", black: "#0a0a0a" };
}
