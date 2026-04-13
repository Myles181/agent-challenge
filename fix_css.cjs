const fs = require('fs');
let c = fs.readFileSync('src/client/app/hero.module.css', 'utf8');

c = c.replace(
  /\$1background: var\(--theme-primary\);\r?\n\s*filter: brightness\(1\.2\);\r?\n\}/,
  `.primaryButton:hover {\n  transform: scale(1.08);\n  box-shadow: 0 0 60px rgba(var(--theme-primary-rgb), 0.5);\n  background: var(--theme-primary);\n  filter: brightness(1.2);\n}`
);

fs.writeFileSync('src/client/app/hero.module.css', c);
