import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const packageFile = path.join(distDir, 'package.json');

const defaultPackage = {
  name: '@umami/components',
  version: '0.0.0',
  description: 'Umami React components.',
  author: 'Mike Cao <mike@mikecao.com>',
  license: 'MIT',
  type: 'module',
  main: './index.js',
  types: './index.d.ts',
  dependencies: {
    'chart.js': '^4.5.0',
    'chartjs-adapter-date-fns': '^3.0.0',
    colord: '^2.9.2',
    jsonwebtoken: '^9.0.2',
    'lucide-react': '^0.542.0',
    'pure-rand': '^7.0.1',
    'react-simple-maps': '^2.3.0',
    'react-use-measure': '^2.0.4',
    'react-window': '^1.8.6',
    'serialize-error': '^12.0.0',
    thenby: '^1.3.4',
    uuid: '^11.1.0',
  },
};

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const pkg = fs.existsSync(packageFile)
  ? JSON.parse(fs.readFileSync(packageFile, 'utf8'))
  : defaultPackage;

const published = execSync(`npm view ${pkg.name} version`, { encoding: 'utf8' }).trim();
const [major, minor] = published.split('.').map(Number);
const next = `${major}.${minor + 1}.0`;

pkg.version = next;

fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Bumped ${pkg.name} version: ${published} -> ${next}`);
