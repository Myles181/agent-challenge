const fs = require('fs');
let c = fs.readFileSync('src/client/app/hero.module.css', 'utf8');

const regex = /\.navWrapper \{[\s\S]*?\.navItemActive \{\s*color: #fff;\s*background: rgba\(var\(--theme-primary-rgb\), 0\.2\);\s*border: 1px solid rgba\(var\(--theme-primary-rgb\), 0\.3\);\s*padding: 0\.4rem 1rem;\s*border-radius: 9999px;\s*\}/;

const replacement = `.navWrapper {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  background: rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(40px) saturate(1.5);
  border: 1px solid var(--theme-border);
  border-radius: 9999px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(var(--theme-primary-rgb), 0.05);
}

.navGroup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.navItem {
  color: #9BA1A6;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  position: relative;
  transition: color 0.3s;
  z-index: 10;
}

.navItem:hover {
  color: #fff;
}

.navHoverBackground {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--theme-primary-rgb), 0.15);
  border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
  box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.2);
  border-radius: 9999px;
  z-index: 0;
}

.navItemActive {
  color: #fff;
  background: rgba(var(--theme-primary-rgb), 0.2);
  border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  transition: all 0.3s;
  cursor: pointer;
}

.navItemActive:hover {
  background: rgba(var(--theme-primary-rgb), 0.3);
  box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.3);
}`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/client/app/hero.module.css', c);
console.log("Updated!");
