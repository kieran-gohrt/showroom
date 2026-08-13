/*
 * Approximate automotive brand colours (primary / dark-hover / near-black base).
 * These are best-effort from each brand's wordmark/logo colour, NOT verified
 * against official brand guideline documents. Always eyeball the live preview
 * and adjust with the colour pickers before shipping to a client.
 */
const BRAND_COLOURS = [
  { name: "Mazda", primary: "#ed1c24", dark: "#b50014", black: "#050505" },
  { name: "Toyota", primary: "#eb0a1e", dark: "#b3000f", black: "#0a0a0a" },
  { name: "Hyundai", primary: "#002c5f", dark: "#001c3d", black: "#0a0a0a" },
  { name: "Kia", primary: "#bb162b", dark: "#8f0f20", black: "#05141e" },
  { name: "Isuzu UTE", primary: "#e2231a", dark: "#a91a13", black: "#0a0a0a" },
  { name: "Ford", primary: "#003478", dark: "#00234f", black: "#0a0a0a" },
  { name: "Holden", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
  { name: "Nissan", primary: "#c3002f", dark: "#8f0021", black: "#0a0a0a" },
  { name: "Mitsubishi", primary: "#e60012", dark: "#a8000d", black: "#0a0a0a" },
  { name: "Subaru", primary: "#0033a0", dark: "#00246f", black: "#0a0a0a" },
  { name: "Honda", primary: "#cc0000", dark: "#990000", black: "#0a0a0a" },
  { name: "Volkswagen", primary: "#001e50", dark: "#001336", black: "#0a0a0a" },
  { name: "Suzuki", primary: "#e30016", dark: "#a8000f", black: "#0a0a0a" },
  { name: "MG", primary: "#ff0000", dark: "#b30000", black: "#0a0a0a" },
  { name: "GWM Haval", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
  { name: "LDV", primary: "#e2231a", dark: "#a91a13", black: "#0a0a0a" },
  { name: "Renault", primary: "#ffcc00", dark: "#cc9900", black: "#0a0a0a" },
  { name: "Peugeot", primary: "#0a0a0a", dark: "#000000", black: "#0a0a0a" },
  { name: "BMW", primary: "#0066b1", dark: "#004a80", black: "#0a0a0a" },
  { name: "Mercedes-Benz", primary: "#00adef", dark: "#0080b3", black: "#0a0a0a" },
  { name: "Audi", primary: "#bb0a30", dark: "#8a0722", black: "#0a0a0a" },
  { name: "Volvo", primary: "#003057", dark: "#001f3a", black: "#0a0a0a" },
  { name: "Jeep", primary: "#4a5d23", dark: "#333f18", black: "#0a0a0a" },
  { name: "RAM", primary: "#1c1c1c", dark: "#000000", black: "#0a0a0a" },
  { name: "Chery", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
  { name: "BYD", primary: "#0a0a0a", dark: "#000000", black: "#0a0a0a" },
  { name: "XPeng", primary: "#00b0ee", dark: "#0080ad", black: "#0a0a0a" },
  { name: "Polestar", primary: "#0a0a0a", dark: "#000000", black: "#0a0a0a" },
  { name: "Tesla", primary: "#cc0000", dark: "#990000", black: "#0a0a0a" },
  { name: "Skoda", primary: "#4ba82e", dark: "#357a1f", black: "#0a0a0a" },
  { name: "Genesis", primary: "#a99677", dark: "#8a7a5f", black: "#0a0a0a" },
  { name: "Chevrolet", primary: "#cc0000", dark: "#990000", black: "#0a0a0a" },
  { name: "Great Wall Motors", primary: "#c8102e", dark: "#8f0b20", black: "#0a0a0a" },
];

function findBrandColours(name) {
  const match = BRAND_COLOURS.find(
    (b) => b.name.toLowerCase() === (name || "").trim().toLowerCase()
  );
  return match || { name: name || "Custom", primary: "#ffc72c", dark: "#c99900", black: "#0b0b0b" };
}
