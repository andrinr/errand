const fs = require('node:fs');
const path = require('node:path');
const site = path.join(__dirname, '../site');
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const share = html.replace('<head>', '<head>\n<base href="https://andrinr.github.io/errand/">')
  .replaceAll('content="https://andrinr.github.io/errand/"', 'content="https://andrinr.github.io/errand/share.html"')
  .replace('rel="canonical" href="https://andrinr.github.io/errand/"', 'rel="canonical" href="https://andrinr.github.io/errand/share.html"');
fs.writeFileSync(path.join(site, 'share.html'), share);
