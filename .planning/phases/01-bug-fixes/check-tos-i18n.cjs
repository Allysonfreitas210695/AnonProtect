// Verifica que as 4 novas chaves Compliance.terms existem nos 3 locales.
const keys = ['object','objectDesc','lgpd','lgpdDesc','limitation','limitationDesc','contact','contactDesc']
let ok = true
for (const locale of ['pt-BR','en','es']) {
  const t = require(`../../../messages/${locale}.json`).Compliance.terms
  for (const k of keys) {
    if (!t[k]) { console.error(`MISSING ${locale}.${k}`); ok = false }
  }
}
if (!ok) process.exit(1)
console.log('all i18n keys present')
