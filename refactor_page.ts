import * as fs from 'fs';
import * as path from 'path';

const pagePath = path.join(process.cwd(), 'src/client/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add imports
content = content.replace(
  /import \{ useState \} from 'react';/,
  `import { useState } from 'react';\nimport { useTheme, ThemeSwitcher } from './theme-engine';`
);

// 2. Add useTheme hook inside HomePage
content = content.replace(
  /export default function HomePage\(\) \{\n  const \[isWalletOpen, setIsWalletOpen\] = useState\(false\);/,
  `export default function HomePage() {\n  const [isWalletOpen, setIsWalletOpen] = useState(false);\n  const { activeTheme, selectTheme } = useTheme();`
);

// 3. Add CSS variables and ThemeSwitcher to the main div
content = content.replace(
  /<div className=\{styles\.heroContainer\}>/,
  `<div className={styles.heroContainer} style={{
      "--theme-primary": activeTheme.primary,
      "--theme-primary-rgb": activeTheme.primaryRgb,
      "--theme-glow": activeTheme.glow,
      "--theme-appBg": activeTheme.appBg,
      "--theme-panelBg": activeTheme.panelBg,
      "--theme-textMain": activeTheme.textMain,
      "--theme-textMuted": activeTheme.textMuted,
      "--theme-border": activeTheme.border,
      color: activeTheme.textMain,
    } as React.CSSProperties}>
    <ThemeSwitcher activeTheme={activeTheme} selectTheme={selectTheme} />`
);

// 4. Regex replacements for tailwind utility classes
const replacements: [RegExp, string][] = [
  [/text-red-(500|600)/g, 'text-[var(--theme-primary)]'],
  [/bg-red-600\/(10|20)/g, (match, opac) => `bg-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/bg-red-(500|600)/g, 'bg-[var(--theme-primary)]'],
  [/border-red-(500|600)\/([0-9]+)/g, (match, strength, opac) => `border-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/border-red-(400|500|600)/g, 'border-[var(--theme-primary)]'],
  [/shadow-red-(500|950)\/([0-9]+)/g, (match, strength, opac) => `shadow-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/from-red-600\/([0-9]+)/g, (match, opac) => `from-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/to-red-900\/([0-9]+)/g, (match, opac) => `to-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/from-red-600/g, 'from-[var(--theme-primary)]'],
  [/to-red-(900|950)/g, 'to-[var(--theme-primary)]'], // just use primary
  [/ring-red-600\/([0-9]+)/g, (match, opac) => `ring-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/ring-red-(500|600)/g, 'ring-[var(--theme-primary)]'],
  [/hover:border-red-600\/([0-9]+)/g, (match, opac) => `hover:border-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/hover:text-red-(500|600)/g, 'hover:text-[var(--theme-primary)]'],
  [/hover:bg-red-600\/([0-9]+)/g, (match, opac) => `hover:bg-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/group-hover\\?:border-red-(400|500)/g, 'group-hover:border-[var(--theme-primary)]'],
  [/group-hover\\?:shadow-red-500\/([0-9]+)/g, (match, opac) => `group-hover:shadow-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/group-hover\\\\?\/item:bg-red-600\/([0-9]+)/g, (match, opac) => `group-hover/item:bg-[rgba(var(--theme-primary-rgb),0.${opac})]`],
  [/#ff0000/gi, 'var(--theme-primary)'],
  [/#550000/gi, 'var(--theme-primary)'],
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement as any);
}

// 5. Replace inline styles in page.tsx that use rgb/rgba directly
content = content.replace(
  /rgba\(220,\s*38,\s*38,\s*([0-9.]+)\)/g,
  (match, opac) => `rgba(var(--theme-primary-rgb), ${opac})`
);

fs.writeFileSync(pagePath, content);
console.log("Updated page.tsx successfully.");
