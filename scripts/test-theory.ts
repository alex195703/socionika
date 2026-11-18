// ============================================================
// Перевірка даних «Теорія перед грою»
// Запуск: bun scripts/test-theory.ts
// ============================================================

import { LESSONS, lessonById, TOPIC_LESSONS, topicCovered, countCheckpoints } from '../src/lib/socionics-theory'
import { buildRound } from '../src/lib/socionics-quiz'
import { ukAbbr } from '../src/lib/socionics-data'

let passed = 0
let failed = 0

function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✗ ${name} ${detail}`)
  }
}

console.log('1) Структура уроків')
check('ровно 6 уроків', LESSONS.length === 6, `— ${LESSONS.length}`)
const ids = LESSONS.map((l) => l.id)
check('id унікальні та за порядком', ids.join(',') === 'l1,l2,l3,l4,l5,l6', `— ${ids.join(',')}`)
check('lessonById знаходить кожен урок', LESSONS.every((l) => lessonById(l.id)?.id === l.id))

console.log('\n2) Теми уроків покривають усі теми вікторини')
const topics = ['types', 'dichotomies', 'functions', 'quadras', 'relations'] as const
for (const t of topics) {
  check(`тема ${t} має урок(и)`, (TOPIC_LESSONS[t]?.length ?? 0) > 0)
}
check('topicCovered(false) на порожньому прогресі', topics.every((t) => !topicCovered(t, {})))
const allDone = Object.fromEntries(['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].map((k) => [k, true]))
check('topicCovered(true) на повному прогресі', topics.every((t) => topicCovered(t, allDone as Record<string, boolean>) && topicCovered('full', allDone as Record<string, boolean>)))
check('functions потребує l3+l4', TOPIC_LESSONS.functions.join(',') === 'l3,l4')

console.log('\n3) Міні-перевірки (чекпоінти)')
let cpTotal = 0
for (const l of LESSONS) {
  const n = countCheckpoints(l)
  cpTotal += n
  check(`${l.id}: 3 міні-перевірки`, n === 3, `— ${n}`)
  const cpIds: string[] = []
  for (const b of l.blocks) {
    if (b.kind !== 'check') continue
    cpIds.push(b.cp.id)
    check(`${b.cp.id}: 4 варіанти`, b.cp.options.length === 4, `— ${b.cp.options.length}`)
    check(`${b.cp.id}: індекс відповіді в межах`, b.cp.correct >= 0 && b.cp.correct < b.cp.options.length)
    check(`${b.cp.id}: пояснення непорожнє`, b.cp.why.uk.length > 10 && b.cp.why.ru.length > 10)
  }
  check(`${l.id}: id чекпоінтів унікальні`, new Set(cpIds).size === cpIds.length)
}
check('усього 18 міні-перевірок', cpTotal === 18, `— ${cpTotal}`)

console.log('\n4) Абревіатури в uk-рядках уже українські')
// Функції [ЧБ][ИЭ] (ЧИ/БИ/ЧЭ/БЭ) і типові скорочення з И/Э заборонені
// в uk-рядках: ukAbbr дає ЧІ/БІ/ЧЕ/БЕ та ІЛЕ/СЕІ... Слова на кшталт
// ТИМ чи ЕТИКА — легітимні українські слова, їх не чіпаємо.
const reBadFn = /(^|[^А-ЯЁІЇЄ])[ЧБ][ИЭ]($|[^А-ЯЁІЇЄ])/
const reBadType = /(^|[^А-ЯЁІЇЄ])[ИСЛЭ]{2,3}($|[^А-ЯЁІЇЄ])/
const bad: string[] = []
for (const l of LESSONS) {
  const texts: string[] = []
  for (const b of l.blocks) {
    if (b.kind === 'p' || b.kind === 'h' || b.kind === 'example') texts.push(b.text.uk)
    if (b.kind === 'list') texts.push(...b.items.map((x) => x.uk))
    if (b.kind === 'table') texts.push(...b.rows.flat().map((x) => x.uk))
    if (b.kind === 'check') texts.push(b.cp.q.uk, ...b.cp.options.map((o) => o.uk), b.cp.why.uk)
  }
  texts.forEach((t) => {
    if (reBadFn.test(t) || reBadType.test(t)) bad.push(`${l.id}: ${t.slice(0, 50)}`)
  })
}
check('укр-рядки без ЧИ/БИ/ЧЭ/БЭ и рос. скорочень', bad.length === 0, `— ${bad.slice(0, 3).join(' | ')}`)
check('ukAbbr працює для прикладів уроку 6', ukAbbr('ИЛЭ') === 'ІЛЕ' && ukAbbr('СЭИ') === 'СЕІ')

console.log('\n5) Вікторина після теорії все ще збирається')
const round = buildRound('relations', 10)
check('раунд «Стосунки» збирається', round.length === 10)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
