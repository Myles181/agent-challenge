import * as fs from 'fs';
import * as path from 'path';

const dashboardPath = path.join(process.cwd(), 'src/client/app/dashboard/page.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Replace THEMES and ThemePreset with import
dashboardContent = dashboardContent.replace(
  /export interface ThemePreset \{[\s\S]*?\};\n/,
  ''
).replace(
  /const THEMES: ThemePreset\[\] = \[[\s\S]*?\];\n/,
  'import { ThemePreset, THEMES, useTheme } from "../theme-engine";\n'
);

dashboardContent = dashboardContent.replace(
  /const \[activeTheme, setActiveTheme\] = useState<ThemePreset>\(THEMES\[0\]\);\n\s*const \[showThemePanel, setShowThemePanel\] = useState\(false\);\n[\s\S]*?const selectTheme = \([\s\S]*?};\n/,
  'const { activeTheme, selectTheme } = useTheme();\n  const [showThemePanel, setShowThemePanel] = useState(false);\n'
);

dashboardContent = dashboardContent.replace(
  /import \{ useState, useEffect, useMemo \} from "react";/,
  'import { useState, useMemo } from "react";'
);

fs.writeFileSync(dashboardPath, dashboardContent);

const heroPath = path.join(process.cwd(), 'src/client/app/hero.module.css');
let heroContent = fs.readFileSync(heroPath, 'utf8');

const heroReplacements: [RegExp, string][] = [
  [/#DC2626/gi, 'var(--theme-primary)'],
  [/#EF4444/gi, 'var(--theme-primary)'],
  [/rgba\(255, 0, 0, 0\.05\)/g, 'rgba(var(--theme-primary-rgb), 0.05)'],
  [/rgba\(220, 38, 38, ([0-9.]+)\)/g, 'rgba(var(--theme-primary-rgb), $1)'],
  [/#000103/g, 'var(--theme-appBg)'],
  [/rgba\(0, 0, 0, 0\.8\)/g, 'var(--theme-appBg)'],
  [/#0A0A0C/g, 'var(--theme-panelBg)'],
  [/rgba\(255, 255, 255, 0\.0[2-58]\)/g, 'var(--theme-border)'],
];

for (const [regex, replacement] of heroReplacements) {
  heroContent = heroContent.replace(regex, replacement);
}

heroContent = heroContent.replace(
  /(?:\.primaryButton:hover \{[\s\S]*?)background: var\(--theme-primary\);/g,
  '$1background: var(--theme-primary);\n  filter: brightness(1.2);'
);


fs.writeFileSync(heroPath, heroContent);

console.log("Updated dashboard and hero css");

