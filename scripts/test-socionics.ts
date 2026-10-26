// ============================================================
// Проверка базы знаний «Соционика» перед сборкой тренажёра
// Запуск: bun scripts/test-socionics.ts
// ============================================================

import {
  TYPES, FUNCTIONS, QUADRAS, type FunctionId,
} from '../src/lib/socionics-data'
import {
  typeByRu, baseFunction, creativeFunction, modelA,
  dualOf, activatorOf, mirrorOf, quasiOf, conflictOf,
  buildRound, label,
} from '../src/lib/socionics-quiz'

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

function pairsMatch(pairs: [string, string][], f: (t: ReturnType<typeof typeByRu>) => ReturnType<typeof typeByRu>, title: string): void {
  console.log(`\n— ${title}`)
  for (const [a, b] of pairs) {
    const ta = typeByRu(a)
    const tb = typeByRu(b)
    const got1 = f(ta).ru
    const got2 = f(tb).ru
    check(`${a} ↔ ${b}`, got1 === b && got2 === a, `— получили ${got1} / ${got2}`)
  }
}

console.log('1) Структура данных: 16 типов')
check('ровно 16 типов', TYPES.length === 16, `— ${TYPES.length}`)
check('уникальные русские аббревиатуры', new Set(TYPES.map((t) => t.ru)).size === 16)
check('уникальные международные коды', new Set(TYPES.map((t) => t.intl)).size === 16)
check('уникальные имена', new Set(TYPES.map((t) => t.name)).size === 16)
const combos = new Set(TYPES.map((t) => [t.ei, t.ns, t.tf, t.rat].join('|')))
check('все 16 комбинаций дихотомий присутствуют (без дыр и дублей)', combos.size === 16)
check('у всех типов заполнено описание', TYPES.every((t) => t.description.length > 40))

console.log('\n2) Квадры')
const expectedQuadras: Record<string, string[]> = {
  alpha: ['ИЛЭ', 'СЭИ', 'ЭСЭ', 'ЛИИ'],
  beta: ['СЛЭ', 'ИЭИ', 'ЭИЭ', 'ЛСИ'],
  gamma: ['СЭЭ', 'ИЛИ', 'ЛИЭ', 'ЭСИ'],
  delta: ['ЛСЭ', 'ЭИИ', 'ИЭЭ', 'СЛИ'],
}
for (const [q, list] of Object.entries(expectedQuadras)) {
  const got = QUADRAS[q as keyof typeof QUADRAS].types
  check(`квадра «${q}»: ${list.join(', ')}`, JSON.stringify([...got].sort()) === JSON.stringify([...list].sort()), `— ${got.join(', ')}`)
  const typesInQuadra = TYPES.filter((t) => t.quadra === q).map((t) => t.ru)
  check(`  типы ${q} согласованы с данными`, JSON.stringify([...typesInQuadra].sort()) === JSON.stringify([...list].sort()))
}

console.log('\n3) Базовая и творческая функции')
const expectedBC: Record<string, [FunctionId, FunctionId]> = {
  'ИЛЭ': ['ЧИ', 'БЛ'], 'СЭИ': ['БС', 'ЧЭ'], 'ЭСЭ': ['ЧЭ', 'БС'], 'ЛИИ': ['БЛ', 'ЧИ'],
  'СЛЭ': ['ЧС', 'БЛ'], 'ИЭИ': ['БИ', 'ЧЭ'], 'ЭИЭ': ['ЧЭ', 'БИ'], 'ЛСИ': ['БЛ', 'ЧС'],
  'СЭЭ': ['ЧС', 'БЭ'], 'ИЛИ': ['БИ', 'ЧЛ'], 'ЛИЭ': ['ЧЛ', 'БИ'], 'ЭСИ': ['БЭ', 'ЧС'],
  'ЛСЭ': ['ЧЛ', 'БС'], 'ЭИИ': ['БЭ', 'ЧИ'], 'ИЭЭ': ['ЧИ', 'БЭ'], 'СЛИ': ['БС', 'ЧЛ'],
}
for (const [ru, [b, c]] of Object.entries(expectedBC)) {
  const t = typeByRu(ru)
  check(`${ru}: базовая ${b}, творческая ${c}`, baseFunction(t) === b && creativeFunction(t) === c, `— получили ${baseFunction(t)} / ${creativeFunction(t)}`)
}

pairsMatch([
  ['ИЛЭ', 'СЭИ'], ['ЭСЭ', 'ЛИИ'], ['СЛЭ', 'ИЭИ'], ['ЭИЭ', 'ЛСИ'],
  ['СЭЭ', 'ИЛИ'], ['ЛИЭ', 'ЭСИ'], ['ЛСЭ', 'ЭИИ'], ['ИЭЭ', 'СЛИ'],
], dualOf, '4) Дуальность — 8 классических пар')

pairsMatch([
  ['ИЛЭ', 'ЭСЭ'], ['СЭИ', 'ЛИИ'], ['СЛЭ', 'ЭИЭ'], ['ИЭИ', 'ЛСИ'],
  ['СЭЭ', 'ЛИЭ'], ['ИЛИ', 'ЭСИ'], ['ЛСЭ', 'ИЭЭ'], ['ЭИИ', 'СЛИ'],
], activatorOf, '5) Активация — 8 пар')

pairsMatch([
  ['ИЛЭ', 'ЛИИ'], ['СЭИ', 'ЭСЭ'], ['СЛЭ', 'ЛСИ'], ['ИЭИ', 'ЭИЭ'],
  ['СЭЭ', 'ЭСИ'], ['ИЛИ', 'ЛИЭ'], ['ЛСЭ', 'СЛИ'], ['ЭИИ', 'ИЭЭ'],
], mirrorOf, '6) Зеркальность — 8 пар')

pairsMatch([
  ['ИЛЭ', 'ЛИЭ'], ['СЭИ', 'ЭСИ'], ['ЭСЭ', 'СЭЭ'], ['ЛИИ', 'ИЛИ'],
  ['ЭИЭ', 'ИЭЭ'], ['ИЭИ', 'ЭИИ'], ['ЛСИ', 'СЛИ'], ['СЛЭ', 'ЛСЭ'],
], quasiOf, '7) Квазитождество — 8 пар')

pairsMatch([
  ['ИЛЭ', 'ЭСИ'], ['СЭИ', 'ЛИЭ'], ['ЭСЭ', 'ИЛИ'], ['ЛИИ', 'СЭЭ'],
  ['СЛЭ', 'ЭИИ'], ['ИЭИ', 'ЛСЭ'], ['ЭИЭ', 'СЛИ'], ['ЛСИ', 'ИЭЭ'],
], conflictOf, '8) Конфликт — 8 пар')

console.log('\n9) Отношения не пересекаются (у типа 5 разных партнёров)')
for (const t of TYPES) {
  const set = new Set([dualOf(t).ru, activatorOf(t).ru, mirrorOf(t).ru, quasiOf(t).ru, conflictOf(t).ru])
  check(`${t.ru}: 5 разных партнёров`, set.size === 5, `— ${[...set]}`)
}

console.log('\n10) Модель А')
for (const t of TYPES) {
  const m = modelA(t)
  const fns = m.map((p) => p.fn)
  const all8 = new Set(fns).size === 8
  const d = dualOf(t)
  const pos5 = m.find((p) => p.n === 5)!.fn
  const pos6 = m.find((p) => p.n === 6)!.fn
  check(`${t.ru}: 8 функций без повторов`, all8, `— ${fns.join(' ')}`)
  check(`  ${t.ru}: суггестивная = базовая дуала`, pos5 === baseFunction(d), `— ${pos5} ≠ ${baseFunction(d)}`)
  check(`  ${t.ru}: активационная = творческая дуала`, pos6 === creativeFunction(d))
  check(`  ${t.ru}: 1-я и 2-я = базовая/творческая`, m[0].fn === baseFunction(t) && m[1].fn === creativeFunction(t))
}

console.log('\n11) Генератор вопросов')
const topics = ['types', 'dichotomies', 'functions', 'quadras', 'relations', 'full'] as const
for (const topic of topics) {
  const round = buildRound(topic, 10)
  const prompts = new Set(round.map((q) => q.prompt))
  const ok = round.length === 10
    && prompts.size === 10
    && round.every((q) => q.options.length === 4 && new Set(q.options).size === 4)
    && round.every((q) => q.correct >= 0 && q.correct < 4)
    && round.every((q) => typeof q.explanation === 'string' && q.explanation.length > 10)
  check(`тема «${topic}»: 10 вопросов, 4 разных варианта, без повторов`, ok)
}

console.log('\n12) Справочник функций')
check('8 функций', Object.keys(FUNCTIONS).length === 8)
check('4 «чёрные» и 4 «белые»', Object.values(FUNCTIONS).filter((f) => f.vertness === 'Ч').length === 4)

console.log(`\n=== Итог: ${passed} прошло, ${failed} упало ===`)
if (failed > 0) process.exit(1)

// Демонстрация: одна случайная пара для глаза
const demo = typeByRu('ЛСЭ')
console.log(`\nПример: ${label(demo, true)} — дуал ${label(dualOf(demo), true)}, конфликт ${label(conflictOf(demo), true)}`)
