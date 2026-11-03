// Перевірка ukAbbr: усі 16 типів, 8 функцій, генерація питань
import { TYPES, FUNCTIONS, ukAbbr } from '../src/lib/socionics-data'
import { buildRound } from '../src/lib/socionics-quiz'

const expect: Record<string, string> = {
  'ИЛЭ': 'ІЛЕ', 'СЭИ': 'СЕІ', 'ЭСЭ': 'ЕСЕ', 'ЛИИ': 'ЛІІ',
  'СЛЭ': 'СЛЕ', 'ИЭИ': 'ІЕІ', 'ЭИЭ': 'ЕІЕ', 'ЛСИ': 'ЛСІ',
  'СЭЭ': 'СЕЕ', 'ИЛИ': 'ІЛІ', 'ЛИЭ': 'ЛІЕ', 'ЭСИ': 'ЕСІ',
  'ЛСЭ': 'ЛСЕ', 'ЭИИ': 'ЕІІ', 'ИЭЭ': 'ІЕЕ', 'СЛИ': 'СЛІ',
  'ЧЛ': 'ЧЛ', 'БЛ': 'БЛ', 'ЧС': 'ЧС', 'БС': 'БС',
  'ЧЭ': 'ЧЕ', 'БЭ': 'БЕ', 'ЧИ': 'ЧІ', 'БИ': 'БІ',
}
let bad = 0
for (const t of TYPES) {
  const got = ukAbbr(t.ru)
  const want = expect[t.ru]
  if (got !== want) { console.log(`FAIL тип ${t.ru}: ${got} != ${want}`); bad++ }
}
for (const f of Object.keys(FUNCTIONS)) {
  const got = ukAbbr(f)
  const want = expect[f]
  if (got !== want) { console.log(`FAIL функція ${f}: ${got} != ${want}`); bad++ }
}
// українські слова з малою «и» не повинні змінюватись
const words = ['системи', 'практику', 'різні', 'Пульс мережі', 'кінь']
for (const w of words) {
  if (ukAbbr(w) !== w) { console.log(`FAIL слово змінено: ${w} → ${ukAbbr(w)}`); bad++ }
}
// питання: uk-рядки без російських И/Э, ru-рядки — з ними
let ukRu = 0, ruAbbrs = 0
for (let i = 0; i < 40; i++) {
  for (const q of buildRound('full')) {
    if (/[ИЭ]/.test(q.prompt.uk) || q.options.some(o => /[ИЭ]/.test(o.uk))) ukRu++
    if (/[іїєґ]/.test(q.prompt.ru) || /[ИЭ]/.test(q.prompt.ru)) ruAbbrs++ // ru без укр. букв, з ИЛЭ
  }
}
if (ukRu > 0) { console.log(`FAIL: ${ukRu} uk-рядків містять російські И/Э`); bad++ }
console.log(bad === 0 ? `✅ ВСЕ ОК: 16 типів + 8 функцій конвертуються, uk-питання чисті` : `❌ провалів: ${bad}`)
