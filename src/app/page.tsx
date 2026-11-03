'use client'

// ============================================================
// СОЦИОНИКА — тренажёр (интерфейс)
// ------------------------------------------------------------
// Второй учебный проект. Логика и данные живут в src/lib/,
// здесь только React: экраны «темы → вопросы → результат»
// и глоссарий. Рекорды хранятся в localStorage.
// Интерфейс двуязычный: українська (за замовчуванням) та
// російська — перемикач <LangSwitch /> у шапці (правий край).
// ============================================================

import { useEffect, useState } from 'react'
import { useL, useBi, LangSwitch, type Bi } from '@/lib/i18n'
import { TYPES, QUADRAS, FUNCTIONS, DICHOTOMIES, type QuadraId, type SocioType } from '@/lib/socionics-data'
import {
  buildRound, typeByRu, baseFunction, dualOf, modelA,
  RELATION_INFO, RELATION_NAMES, TOPIC_LABELS, TOPIC_HINTS,
  type Question, type Topic, type RelationKind,
} from '@/lib/socionics-quiz'

// Квадровые цвета (выбранный дизайн: 4 квадры — 4 цвета)
const QUADRA_STYLE: Record<QuadraId, { chip: string; bar: string; soft: string; text: string; border: string }> = {
  alpha: { chip: 'bg-sky-100 text-sky-700 border-sky-300', bar: 'bg-sky-500', soft: 'bg-sky-50', text: 'text-sky-700', border: 'border-l-sky-500' },
  beta: { chip: 'bg-rose-100 text-rose-700 border-rose-300', bar: 'bg-rose-500', soft: 'bg-rose-50', text: 'text-rose-700', border: 'border-l-rose-500' },
  gamma: { chip: 'bg-emerald-100 text-emerald-700 border-emerald-300', bar: 'bg-emerald-500', soft: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500' },
  delta: { chip: 'bg-amber-100 text-amber-700 border-amber-300', bar: 'bg-amber-500', soft: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-500' },
}

// Цвет карточки темы — для разнообразия интерфейса
const TOPIC_QUADRA: Record<Topic, QuadraId> = {
  types: 'alpha', dichotomies: 'beta', functions: 'gamma',
  quadras: 'delta', relations: 'alpha', full: 'gamma',
}

const TOPICS: Topic[] = ['types', 'dichotomies', 'functions', 'quadras', 'relations', 'full']
const LETTERS = ['А', 'Б', 'В', 'Г']
const RELATION_ORDER: RelationKind[] = ['дуальность', 'активация', 'зеркальность', 'квазитождество', 'конфликт']

const TERMS: { term: Bi; text: Bi }[] = [
  {
    term: { uk: 'Соціоніка', ru: 'Соционика' },
    text: {
      uk: 'Типологія особистості, створена Аушрою Аугустінавічюте на основі ідей К. Г. Юнга: 16 типів, 8 функцій, система стосунків між типами. Науковий статус теорії є дискусійним — тренажер допомагає вивчати її як концепцію.',
      ru: 'Типология личности, созданная Аушрой Аугустинавичюте на основе идей К. Г. Юнга: 16 типов, 8 функций, система отношений между типами. Научный статус теории дискуссионен — тренажёр помогает изучать её как концепцию.',
    },
  },
  {
    term: { uk: 'Тип особистості (ТИМ)', ru: 'Тип личности (ТИМ)' },
    text: {
      uk: 'Спосіб обміну інформацією зі світом: що людина краще бачить, як ухвалює рішення та як організовує життя. Записується абревіатурою з літер дихотомій, наприклад ИЛЭ.',
      ru: 'Способ обмена информацией с миром: что человек лучше видит, как решает и как организует жизнь. Записывается аббревиатурой из букв дихотомий, например ИЛЭ.',
    },
  },
  ...DICHOTOMIES.map((d) => ({
    term: { uk: `${d.pairNames.uk} (${d.intlLetter})`, ru: `${d.pairNames.ru} (${d.intlLetter})` },
    text: d.explanation,
  })),
  {
    term: { uk: 'Квадра', ru: 'Квадра' },
    text: {
      uk: 'Група з 4 типів зі спільними цінностями та приємною внутрішньою атмосферою: Альфа, Бета, Гамма, Дельта.',
      ru: 'Группа из 4 типов с общими ценностями и приятной внутренней атмосферой: Альфа, Бета, Гамма, Дельта.',
    },
  },
  {
    term: { uk: 'Модель А', ru: 'Модель А' },
    text: {
      uk: 'Структура психіки типу з 8 позицій: базова (1), творча (2), рольова (3), вразлива (4), сугестивна (5), активаційна (6), обмежувальна (7), спостережлива (8).',
      ru: 'Структура психики типа из 8 позиций: базовая (1), творческая (2), ролевая (3), болевая (4), суггестивная (5), активационная (6), ограничительная (7), демонстративная (8).',
    },
  },
  {
    term: { uk: 'Вразлива функція (PoLR)', ru: 'Болевая функция (PoLR)' },
    text: {
      uk: 'Найвразливіше місце типу (4-та позиція моделі А): критика в цій галузі особливо неприємна.',
      ru: 'Самое уязвимое место типа (4-я позиция модели А): критика в этой области особенно неприятна.',
    },
  },
  {
    term: { uk: 'Ревізія', ru: 'Ревизия' },
    text: {
      uk: 'Стосунки «нагляду»: ревізор мимоволі бачить слабкості підревізного й тисне, а той напружений і відчуває контроль.',
      ru: 'Отношения «надзора»: ревизор невольно видит слабости подревизного и давит, тот напряжён и чувствует контроль.',
    },
  },
  {
    term: { uk: 'Замовлення', ru: 'Заказ' },
    text: {
      uk: 'Стосунки «делегування»: замовник спрямовує підзамовному прохання та завдання, які тому зручно виконувати.',
      ru: 'Отношения «делегирования»: заказчик направляет подзаказному просьбы и задачи, которые тому удобно выполнять.',
    },
  },
  ...RELATION_ORDER.map((k) => ({ term: RELATION_NAMES[k], text: RELATION_INFO[k] })),
]

type Screen = 'start' | 'quiz' | 'result' | 'glossary'
type Records = Partial<Record<Topic, number>>
const QUESTIONS_PER_ROUND = 10
const RECORDS_KEY = 'socionika-records'

export default function SocionicsTrainer() {
  const L = useL()
  const B = useBi()
  const [screen, setScreen] = useState<Screen>('start')
  const [intl, setIntl] = useState(false)
  const [records, setRecords] = useState<Records>({})
  const [topic, setTopic] = useState<Topic>('full')
  const [questions, setQuestions] = useState<Question[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [glossaryTab, setGlossaryTab] = useState<'types' | 'model' | 'terms'>('types')
  const [modelType, setModelType] = useState('ИЛЭ')

  // Рекорды читаем из localStorage после монтирования
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(RECORDS_KEY)
        if (raw) setRecords(JSON.parse(raw) as Records)
      } catch { /* приватный режим — просто без рекордов */ }
    })
  }, [])

  function startRound(t: Topic): void {
    setTopic(t)
    setQuestions(buildRound(t, QUESTIONS_PER_ROUND))
    setQIndex(0)
    setSelected(null)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setIsNewRecord(false)
    setScreen('quiz')
  }

  function handleSelect(i: number): void {
    if (selected !== null || !questions.length) return
    setSelected(i)
    const q = questions[qIndex]
    if (i === q.correct) {
      const nextStreak = streak + 1
      setScore(score + 1)
      setStreak(nextStreak)
      setBestStreak(Math.max(bestStreak, nextStreak))
    } else {
      setStreak(0)
    }
  }

  function handleNext(): void {
    if (selected === null) return
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1)
      setSelected(null)
      return
    }
    // Раунд закончен — сохраняем рекорд
    const prev = records[topic] ?? 0
    if (score > prev) {
      const updated = { ...records, [topic]: score }
      setRecords(updated)
      setIsNewRecord(true)
      try { localStorage.setItem(RECORDS_KEY, JSON.stringify(updated)) } catch { /* приватный режим */ }
    }
    setScreen('result')
  }

  // Клавиатура: 1-4 — ответ, Enter — дальше (эффект объявлен после обработчиков)
  useEffect(() => {
    if (screen !== 'quiz') return
    const onKey = (e: KeyboardEvent) => {
      if (selected === null && ['1', '2', '3', '4'].includes(e.key)) {
        handleSelect(Number(e.key) - 1)
      } else if (selected !== null && e.key === 'Enter') {
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ---------- Экран: темы ----------
  if (screen === 'start') {
    return (
      <Shell>
        <header className="text-center mb-8">
          <div className="flex h-3 rounded-full overflow-hidden mb-6 shadow-sm">
            <div className="flex-1 bg-sky-500" />
            <div className="flex-1 bg-rose-500" />
            <div className="flex-1 bg-emerald-500" />
            <div className="flex-1 bg-amber-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{L('Соціоніка: тренажер', 'Соционика: тренажёр')}</h1>
          <p className="mt-3 text-stone-600 leading-relaxed">
            {L(
              'Відгадуй 16 типів, функції, квадри та стосунки — запам’ятовуй теорію, граючись. Після кожної відповіді — коротке пояснення.',
              'Угадывай 16 типов, функции, квадры и отношения — запоминай теорию играя. После каждого ответа — короткое объяснение.',
            )}
          </p>
          <NotationToggle intl={intl} setIntl={setIntl} className="mt-5 justify-center" />
        </header>

        <div className="grid sm:grid-cols-2 gap-3">
          {TOPICS.map((t) => {
            const q = TOPIC_QUADRA[t]
            const best = records[t]
            return (
              <button
                key={t}
                onClick={() => startRound(t)}
                className={`text-left bg-white rounded-2xl border-2 p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 border-stone-200 hover:${''} focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${QUADRA_STYLE[q].chip}`}>
                    {B(TOPIC_LABELS[t])}
                  </span>
                  {best !== undefined && <span className="text-xs text-stone-500">{L(`рекорд ${best}/10`, `рекорд ${best}/10`)}</span>}
                </div>
                <div className="mt-2 font-semibold">{B(TOPIC_HINTS[t])}</div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setScreen('glossary')}
          className="mt-6 w-full rounded-2xl border-2 border-dashed border-stone-300 py-4 font-medium text-stone-600 hover:bg-white hover:border-stone-400 transition-colors"
        >
          {L('📖 Глосарій: 16 типів, модель А і терміни', '📖 Глоссарий: 16 типов, модель А и термины')}
        </button>
      </Shell>
    )
  }

  // ---------- Экран: вопрос ----------
  if (screen === 'quiz') {
    const q = questions[qIndex]
    const style = QUADRA_STYLE[q.accent]
    const answered = selected !== null
    const progress = ((qIndex + (answered ? 1 : 0)) / questions.length) * 100
    return (
      <Shell>
        <div className="flex items-center justify-between gap-3 text-sm">
          <button onClick={() => setScreen('start')} className="text-stone-500 hover:text-stone-800 font-medium">
            {L('← Вийти', '← Выйти')}
          </button>
          <span className="text-stone-600 font-medium">{B(TOPIC_LABELS[topic])} · {qIndex + 1}/{questions.length}</span>
          <span className="font-bold">{score > 0 ? `${score} ✓` : '0 ✓'}{streak >= 2 && <span className="ml-1">🔥{streak}</span>}</span>
        </div>

        <div className="mt-3 h-2 rounded-full bg-stone-200 overflow-hidden">
          <div className={`h-full ${style.bar} transition-all duration-300`} style={{ width: `${progress}%` }} />
        </div>

        <div className={`mt-5 bg-white rounded-2xl border border-stone-200 border-l-8 ${style.border} p-5 sm:p-6 shadow-sm`}>
          <p className="whitespace-pre-line text-lg leading-relaxed font-medium">{B(q.prompt)}</p>
        </div>

        <div className="mt-4 grid gap-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = answered && i === q.correct
            const isWrongPick = answered && i === selected && i !== q.correct
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={`flex items-start gap-3 text-left rounded-xl border-2 p-3.5 sm:p-4 transition-all min-h-[44px] ${
                  isCorrect ? 'border-emerald-500 bg-emerald-50'
                  : isWrongPick ? 'border-rose-500 bg-rose-50'
                  : answered ? 'border-stone-200 bg-white opacity-50'
                  : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm'
                }`}
              >
                <span className={`shrink-0 w-7 h-7 rounded-full border-2 grid place-items-center text-sm font-bold ${
                  isCorrect ? 'border-emerald-500 text-emerald-700 bg-emerald-100'
                  : isWrongPick ? 'border-rose-500 text-rose-700 bg-rose-100'
                  : 'border-stone-300 text-stone-500'
                }`}>{LETTERS[i]}</span>
                <span className="pt-0.5 leading-snug">{B(opt)}</span>
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`mt-4 rounded-xl p-4 ${QUADRA_STYLE[q.accent].soft}`}>
            <p className="leading-relaxed">
              <span className="font-bold">
                {selected === q.correct
                  ? L('✅ Правильно! ', '✅ Верно! ')
                  : L(`❌ Правильна відповідь: ${B(q.options[q.correct])}. `, `❌ Верный ответ: ${B(q.options[q.correct])}. `)}
              </span>
              {B(q.explanation)}
            </p>
            <button
              onClick={handleNext}
              className="mt-4 w-full rounded-xl bg-stone-900 text-white py-3 font-semibold hover:bg-stone-700 transition-colors"
            >
              {qIndex + 1 < questions.length ? L('Далі →', 'Дальше →') : L('Результати →', 'Результаты →')}
            </button>
          </div>
        )}
      </Shell>
    )
  }

  // ---------- Экран: результат ----------
  if (screen === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'
    const verdict = pct >= 90
      ? L('Блискуче! Теорія в тебе в кишені.', 'Блестяще! Теория у тебя в кармане.')
      : pct >= 70
      ? L('Чудовий результат! Ще крок до ідеалу.', 'Отличный результат! Ещё чуть-чуть до идеала.')
      : pct >= 50
      ? L('Добрий початок — зазирни в глосарій і спробуй ще раз.', 'Хорошее начало — загляни в глоссарий и попробуй снова.')
      : L('Не здавайся: спершу глосарій, потім раунд на тему «Типи».', 'Не сдавайся: сначала глоссарий, потом раунд на тему «Типы».')
    return (
      <Shell>
        <div className="text-center bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-sm">
          <div className="text-6xl">{emoji}</div>
          <h2 className="mt-4 text-2xl font-extrabold">{score} {L('з', 'из')} {questions.length}</h2>
          <p className="mt-1 text-stone-500">{pct}% · {L('найкраща серія', 'лучший стрик')} 🔥{bestStreak}</p>
          {isNewRecord && (
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-sm font-bold">
              🏆 {L('Новий рекорд!', 'Новый рекорд!')}
            </div>
          )}
          <p className="mt-4 text-stone-600">{verdict}</p>
          <div className="mt-7 grid sm:grid-cols-2 gap-3">
            <button onClick={() => startRound(topic)} className="rounded-xl bg-stone-900 text-white py-3 font-semibold hover:bg-stone-700 transition-colors">
              {L('Ще раунд', 'Ещё раунд')}
            </button>
            <button onClick={() => setScreen('start')} className="rounded-xl border-2 border-stone-300 py-3 font-semibold hover:border-stone-500 transition-colors">
              {L('До тем', 'К темам')}
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  // ---------- Экран: глоссарий ----------
  const mt = typeByRu(modelType)
  const ma = modelA(mt)
  const blocks: { title: Bi; hint: Bi; positions: typeof ma }[] = [
    { title: { uk: 'Его', ru: 'Эго' }, hint: { uk: 'сильні, усвідомлені функції', ru: 'сильные, осознанные функции' }, positions: ma.slice(0, 2) },
    { title: { uk: 'Супер-Его', ru: 'Супер-Эго' }, hint: { uk: 'зона обов’язку та вразливості', ru: 'зона долга и уязвимости' }, positions: ma.slice(2, 4) },
    { title: { uk: 'Супер-Ід', ru: 'Супер-Ид' }, hint: { uk: 'зона натхнення від дуала', ru: 'зона вдохновения от дуала' }, positions: ma.slice(4, 6) },
    { title: { uk: 'Ід', ru: 'Ид' }, hint: { uk: 'фонові сильні функції', ru: 'фоновые сильные функции' }, positions: ma.slice(6, 8) },
  ]
  return (
    <Shell>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setScreen('start')} className="text-stone-500 hover:text-stone-800 font-medium">
          {L('← До тем', '← К темам')}
        </button>
        <NotationToggle intl={intl} setIntl={setIntl} />
      </div>

      <h2 className="mt-4 text-2xl font-extrabold">{L('📖 Глосарій', '📖 Глоссарий')}</h2>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {([
          ['types', L('16 типів', '16 типов')],
          ['model', L('Модель А', 'Модель А')],
          ['terms', L('Терміни', 'Термины')],
        ] as const).map(([key, lbl]) => (
          <button
            key={key}
            onClick={() => setGlossaryTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border-2 transition-colors ${
              glossaryTab === key ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {glossaryTab === 'types' && (
        <div className="mt-5">
          {(Object.keys(QUADRAS) as QuadraId[]).map((qid) => {
            const quad = QUADRAS[qid]
            return (
              <section key={qid} className="mb-5">
                <h3 className={`font-bold ${QUADRA_STYLE[qid].text}`}>
                  {B(quad.name)} · {B(quad.motto)}
                </h3>
                <p className="text-sm text-stone-500 mt-0.5">{B(quad.description)}</p>
                <div className="mt-2 grid gap-2">
                  {quad.types.map(typeByRu).map((t) => (
                    <TypeRow key={t.ru} t={t} intl={intl} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {glossaryTab === 'model' && (
        <div className="mt-5">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.ru}
                onClick={() => setModelType(t.ru)}
                className={`rounded-lg border-2 py-2 text-sm font-bold transition-colors ${
                  modelType === t.ru ? `${QUADRA_STYLE[t.quadra].chip} border-current` : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                {intl ? t.intl : t.ru}
              </button>
            ))}
          </div>
          <p className="mt-4 text-stone-600">
            <span className="font-bold">{intl ? `${mt.intl} „${mt.intlName}“` : `${mt.ru} „${mt.name}“`}</span>{' '}
            {L('— модель А. Сугестивна (5-та) функція = базова в дуала: ', '— модель А. Суггестивная (5-я) функция = базовая у дуала: ')}
            {intl ? dualOf(mt).intl : dualOf(mt).ru}.
          </p>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {blocks.map((b) => (
              <div key={b.title.ru} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="font-bold">{B(b.title)} <span className="text-xs font-normal text-stone-500">— {B(b.hint)}</span></div>
                <div className="mt-2 grid gap-2">
                  {b.positions.map((p) => (
                    <div key={p.n} className="flex items-baseline gap-2 text-sm">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-stone-900 text-white grid place-items-center text-xs font-bold">{p.n}</span>
                      <span><b className="font-bold">{p.fn}</b> — {B(FUNCTIONS[p.fn].name)} <span className="text-stone-400">({B(p.role)})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {glossaryTab === 'terms' && (
        <dl className="mt-5 grid gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
          {TERMS.map((item) => (
            <div key={item.term.ru} className="bg-white rounded-xl border border-stone-200 p-4">
              <dt className="font-bold">{B(item.term)}</dt>
              <dd className="mt-1 text-sm text-stone-600 leading-relaxed">{B(item.text)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Shell>
  )
}

// ---------- Вспомогательные компоненты ----------

function Shell({ children }: { children: React.ReactNode }) {
  const L = useL()
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 antialiased">
      <div className="w-full max-w-2xl mx-auto px-4 pt-4 flex justify-end">
        <LangSwitch />
      </div>
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">{children}</main>
      <footer className="mt-auto py-5 px-4 text-center text-xs text-stone-400 leading-relaxed">
        {L(
          'Навчальний проєкт №2 · Соціоніка — типологія А. Аугустінавічюте на основі ідей К. Г. Юнга. Науковий статус теорії є дискусійним; тренажер — для знайомства з концепцією.',
          'Учебный проект №2 · Соционика — типология А. Аугустинавичюте на основе идей К. Г. Юнга. Научный статус теории дискуссионен; тренажёр — для знакомства с концепцией.',
        )}
      </footer>
    </div>
  )
}

function NotationToggle({ intl, setIntl, className = '' }: { intl: boolean; setIntl: (v: boolean) => void; className?: string }) {
  const L = useL()
  return (
    <div className={`inline-flex rounded-xl border-2 border-stone-200 bg-white p-1 ${className}`} role="group" aria-label={L('Система позначень', 'Система обозначений')}>
      <button
        onClick={() => setIntl(false)}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${!intl ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'}`}
      >
        {L('ИЛЭ · кирилиця', 'ИЛЭ · рус')}
      </button>
      <button
        onClick={() => setIntl(true)}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${intl ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'}`}
      >
        {L('ILE · міжнар', 'ILE · межд')}
      </button>
    </div>
  )
}

function TypeRow({ t, intl }: { t: SocioType; intl: boolean }) {
  const L = useL()
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 bg-white rounded-xl border border-stone-200 p-3 border-l-4 ${QUADRA_STYLE[t.quadra].border}`}>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${QUADRA_STYLE[t.quadra].chip}`}>
        {intl ? t.intl : t.ru}
      </span>
      <span className="font-semibold">{intl ? t.intlName : t.name}</span>
      <span className="text-xs text-stone-400">{intl ? t.ru : t.intl}</span>
      <span className="text-sm text-stone-500 ml-auto">
        {L(`базова ${baseFunction(t)} · дуал ${intl ? dualOf(t).intl : dualOf(t).ru}`, `базовая ${baseFunction(t)} · дуал ${intl ? dualOf(t).intl : dualOf(t).ru}`)}
      </span>
    </div>
  )
}
