import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('tests/component/article-tags.strategy.test.jsx');
const destination = resolve('.sut/conduit/frontend/src/components/ArticleTags/strategy-lab.test.jsx');

if (!existsSync('.sut/conduit/frontend/src/components/ArticleTags/ArticleTags.jsx')) {
  throw new Error('SUT is missing. Run npm run sut:fetch first.');
}

copyFileSync(source, destination);
console.log(`Injected component test: ${destination}`);
