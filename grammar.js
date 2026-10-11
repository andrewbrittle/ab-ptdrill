// Português Drill - grammar data: verbs, contractions and the grammar notes.
// Loaded by index.html with <script src="grammar.js"> (after vocab.js); the
// app reads window.PT_DRILL_GRAMMAR. Kept apart from the app code for the same
// reason as vocab.js: the content can grow without touching the engine.
//
// VERBS
//   inf        the infinitive
//   group      'ar' | 'er' | 'ir' (the regular pattern it follows) or 'irr'
//   en         English forms for the prompts: [base, he/she form, past, -ing]
//              e.g. ['speak', 'speaks', 'spoke', 'speaking']. 'be' is special.
//   enImp      (optional) English for "was / used to" if "used to <base>" reads badly
//   enFut      (optional) English base after "going to" if different
//   forms      (optional) overrides, by tense, five forms each in person order
//              eu, tu, ele/ela/você, nós, eles/elas/vocês. null = follow the
//              regular pattern. "a|b" = a is shown, both are accepted.
//   skip       (optional) tenses this verb isn't drilled in (sounds wrong)
//   notes      (optional) a note shown after answering, by tense
// The app builds every form not listed from the regular endings (and the
// -car/-gar/-çar spelling changes in the past), and builds the two
// compound tenses from estar a + infinitive and ir + infinitive.
//
// Scores are keyed on infinitive + tense + person, so editing a form keeps
// its score.
window.PT_DRILL_GRAMMAR = {
  persons: [
    { pt: 'eu', en: 'I' },
    { pt: 'tu', en: 'you' },
    { pt: 'ele/ela', en: 'he/she' },
    { pt: 'nós', en: 'we' },
    { pt: 'eles/elas', en: 'they' },
  ],
  tenses: [
    { key: 'pres', label: 'Present', hint: 'now / usually' },
    { key: 'pret', label: 'Past', hint: 'did' },
    { key: 'imp', label: 'Was / used to', hint: 'was doing / used to' },
    { key: 'prog', label: 'Right now', hint: 'estar a …' },
    { key: 'fut', label: 'Going to', hint: 'ir + …' },
  ],
  verbs: [
    // ---- Irregular (the ones that matter most) ----
    { inf: 'ser', group: 'irr', en: ['be', 'is', 'was', 'being'], enImp: 'used to be', skip: ['prog'],
      forms: { pres: ['sou', 'és', 'é', 'somos', 'são'], pret: ['fui', 'foste', 'foi', 'fomos', 'foram'], imp: ['era', 'eras', 'era', 'éramos', 'eram'] },
      notes: { pret: 'The past of ser and ir is the same: fui = I was / I went.' } },
    { inf: 'estar', group: 'irr', en: ['be', 'is', 'was', 'being'], enImp: 'used to be', skip: ['prog'],
      forms: { pres: ['estou', 'estás', 'está', 'estamos', 'estão'], pret: ['estive', 'estiveste', 'esteve', 'estivemos', 'estiveram'] } },
    { inf: 'ter', group: 'irr', en: ['have', 'has', 'had', 'having'], skip: ['prog'],
      forms: { pres: ['tenho', 'tens', 'tem', 'temos', 'têm'], pret: ['tive', 'tiveste', 'teve', 'tivemos', 'tiveram'], imp: ['tinha', 'tinhas', 'tinha', 'tínhamos', 'tinham'] },
      notes: { pres: 'tem (he/she has) and têm (they have) sound the same in Portugal.' } },
    { inf: 'ir', group: 'irr', en: ['go', 'goes', 'went', 'going'], skip: ['prog', 'fut'],
      forms: { pres: ['vou', 'vais', 'vai', 'vamos', 'vão'], pret: ['fui', 'foste', 'foi', 'fomos', 'foram'], imp: ['ia', 'ias', 'ia', 'íamos', 'iam'] },
      notes: { pret: 'The past of ir and ser is the same: fui = I went / I was.' } },
    { inf: 'vir', group: 'irr', en: ['come', 'comes', 'came', 'coming'],
      forms: { pres: ['venho', 'vens', 'vem', 'vimos', 'vêm'], pret: ['vim', 'vieste', 'veio', 'viemos', 'vieram'], imp: ['vinha', 'vinhas', 'vinha', 'vínhamos', 'vinham'] },
      notes: { pres: 'Careful: vimos is "we come" here - and also "we saw" (from ver).' } },
    { inf: 'fazer', group: 'irr', en: ['do', 'does', 'did', 'doing'],
      forms: { pres: ['faço', 'fazes', 'faz', 'fazemos', 'fazem'], pret: ['fiz', 'fizeste', 'fez', 'fizemos', 'fizeram'] } },
    { inf: 'dizer', group: 'irr', en: ['say', 'says', 'said', 'saying'],
      forms: { pres: ['digo', 'dizes', 'diz', 'dizemos', 'dizem'], pret: ['disse', 'disseste', 'disse', 'dissemos', 'disseram'] } },
    { inf: 'poder', group: 'irr', en: ['can', 'can', 'could', 'being able to'], enImp: 'used to be able to', enFut: 'be able to', skip: ['prog'],
      forms: { pres: ['posso', 'podes', 'pode', 'podemos', 'podem'], pret: ['pude', 'pudeste', 'pôde', 'pudemos', 'puderam'] },
      notes: { pret: 'pôde (he could, past) has a hat; pode (he can, present) doesn\'t.' } },
    { inf: 'querer', group: 'irr', en: ['want', 'wants', 'wanted', 'wanting'], skip: ['prog'],
      forms: { pres: ['quero', 'queres', 'quer', 'queremos', 'querem'], pret: ['quis', 'quiseste', 'quis', 'quisemos', 'quiseram'] },
      notes: { imp: 'queria is also the polite "I\'d like": queria um café.' } },
    { inf: 'saber', group: 'irr', en: ['know', 'knows', 'knew', 'knowing'], skip: ['prog'],
      forms: { pres: ['sei', 'sabes', 'sabe', 'sabemos', 'sabem'], pret: ['soube', 'soubeste', 'soube', 'soubemos', 'souberam'] },
      notes: { pret: 'In the past, soube usually means "found out".' } },
    { inf: 'conhecer', group: 'irr', en: ['know (a person or place)', 'knows (a person or place)', 'met', 'knowing'], enImp: 'used to know (a person or place)', skip: ['prog'],
      forms: { pres: ['conheço', null, null, null, null] },
      notes: { pret: 'In the past, conheci usually means "I met (for the first time)".' } },
    { inf: 'ver', group: 'irr', en: ['see', 'sees', 'saw', 'seeing'],
      forms: { pres: ['vejo', 'vês', 'vê', 'vemos', 'veem'], pret: ['vi', 'viste', 'viu', 'vimos', 'viram'] } },
    { inf: 'dar', group: 'irr', en: ['give', 'gives', 'gave', 'giving'],
      forms: { pres: ['dou', 'dás', 'dá', 'damos', 'dão'], pret: ['dei', 'deste', 'deu', 'demos', 'deram'] } },
    { inf: 'pôr', group: 'irr', en: ['put', 'puts', 'put', 'putting'],
      forms: { pres: ['ponho', 'pões', 'põe', 'pomos', 'põem'], pret: ['pus', 'puseste', 'pôs', 'pusemos', 'puseram'], imp: ['punha', 'punhas', 'punha', 'púnhamos', 'punham'] } },
    { inf: 'trazer', group: 'irr', en: ['bring', 'brings', 'brought', 'bringing'],
      forms: { pres: ['trago', 'trazes', 'traz', 'trazemos', 'trazem'], pret: ['trouxe', 'trouxeste', 'trouxe', 'trouxemos', 'trouxeram'] } },
    { inf: 'ler', group: 'irr', en: ['read', 'reads', 'read', 'reading'],
      forms: { pres: ['leio', 'lês', 'lê', 'lemos', 'leem'], pret: ['li', 'leste', 'leu', 'lemos', 'leram'] } },
    { inf: 'sair', group: 'irr', en: ['go out', 'goes out', 'went out', 'going out'],
      forms: { pres: ['saio', 'sais', 'sai', 'saímos', 'saem'], pret: ['saí', 'saíste', 'saiu', 'saímos', 'saíram'], imp: ['saía', 'saías', 'saía', 'saíamos', 'saíam'] } },
    { inf: 'ouvir', group: 'irr', en: ['hear', 'hears', 'heard', 'hearing'],
      forms: { pres: ['ouço|oiço', null, null, null, null] },
      notes: { pres: 'oiço is just as common as ouço in Portugal.' } },
    { inf: 'pedir', group: 'irr', en: ['order', 'orders', 'ordered', 'ordering'],
      forms: { pres: ['peço', null, null, null, null] },
      notes: { pres: 'pedir is to ask FOR something; perguntar is to ask a question.' } },
    { inf: 'dormir', group: 'irr', en: ['sleep', 'sleeps', 'slept', 'sleeping'],
      forms: { pres: ['durmo', null, null, null, null] } },
    { inf: 'preferir', group: 'irr', en: ['prefer', 'prefers', 'preferred', 'preferring'], skip: ['prog'],
      forms: { pres: ['prefiro', null, null, null, null] } },

    // ---- Regular -ar ----
    { inf: 'falar', group: 'ar', en: ['speak', 'speaks', 'spoke', 'speaking'] },
    { inf: 'trabalhar', group: 'ar', en: ['work', 'works', 'worked', 'working'] },
    { inf: 'morar', group: 'ar', en: ['live', 'lives', 'lived', 'living'] },
    { inf: 'gostar', group: 'ar', en: ['like', 'likes', 'liked', 'liking'], skip: ['prog'],
      notes: { pres: 'Always gostar de: gosto de vinho, gosto do Porto.', imp: 'gostava de is also the polite "I\'d like": gostava de um café.' } },
    { inf: 'comprar', group: 'ar', en: ['buy', 'buys', 'bought', 'buying'] },
    { inf: 'pagar', group: 'ar', en: ['pay', 'pays', 'paid', 'paying'] },
    { inf: 'chegar', group: 'ar', en: ['arrive', 'arrives', 'arrived', 'arriving'] },
    { inf: 'ficar', group: 'ar', en: ['stay', 'stays', 'stayed', 'staying'] },
    { inf: 'começar', group: 'ar', en: ['start', 'starts', 'started', 'starting'] },
    { inf: 'tomar', group: 'ar', en: ['have (a drink)', 'has (a drink)', 'had (a drink)', 'having (a drink)'] },
    { inf: 'levar', group: 'ar', en: ['take', 'takes', 'took', 'taking'] },
    { inf: 'voltar', group: 'ar', en: ['come back', 'comes back', 'came back', 'coming back'] },
    { inf: 'esperar', group: 'ar', en: ['wait', 'waits', 'waited', 'waiting'] },
    { inf: 'ajudar', group: 'ar', en: ['help', 'helps', 'helped', 'helping'] },
    { inf: 'apanhar', group: 'ar', en: ['catch', 'catches', 'caught', 'catching'] },
    { inf: 'procurar', group: 'ar', en: ['look for', 'looks for', 'looked for', 'looking for'] },
    { inf: 'encontrar', group: 'ar', en: ['find', 'finds', 'found', 'finding'] },
    { inf: 'pensar', group: 'ar', en: ['think', 'thinks', 'thought', 'thinking'] },
    { inf: 'viajar', group: 'ar', en: ['travel', 'travels', 'travelled', 'travelling'] },
    { inf: 'perguntar', group: 'ar', en: ['ask', 'asks', 'asked', 'asking'] },
    { inf: 'jantar', group: 'ar', en: ['have dinner', 'has dinner', 'had dinner', 'having dinner'] },
    { inf: 'almoçar', group: 'ar', en: ['have lunch', 'has lunch', 'had lunch', 'having lunch'] },
    { inf: 'estudar', group: 'ar', en: ['study', 'studies', 'studied', 'studying'] },
    { inf: 'precisar', group: 'ar', en: ['need', 'needs', 'needed', 'needing'], skip: ['prog'],
      notes: { pres: 'Always precisar de: preciso de ajuda.' } },

    // ---- Regular -er ----
    { inf: 'comer', group: 'er', en: ['eat', 'eats', 'ate', 'eating'] },
    { inf: 'beber', group: 'er', en: ['drink', 'drinks', 'drank', 'drinking'] },
    { inf: 'aprender', group: 'er', en: ['learn', 'learns', 'learnt', 'learning'] },
    { inf: 'escrever', group: 'er', en: ['write', 'writes', 'wrote', 'writing'] },
    { inf: 'perceber', group: 'er', en: ['understand', 'understands', 'understood', 'understanding'], skip: ['prog'] },
    { inf: 'vender', group: 'er', en: ['sell', 'sells', 'sold', 'selling'] },

    // ---- Regular -ir ----
    { inf: 'abrir', group: 'ir', en: ['open', 'opens', 'opened', 'opening'] },
    { inf: 'partir', group: 'ir', en: ['leave (set off)', 'leaves (sets off)', 'left (set off)', 'leaving (setting off)'] },
    { inf: 'decidir', group: 'ir', en: ['decide', 'decides', 'decided', 'deciding'] },
  ],

  // CONTRACTIONS - preposition + article/word, drilled inside a sentence.
  // ___ marks the gap.
  contractions: [
    { parts: 'em + o', answer: 'no', pt: 'Estou ___ hotel.', en: "I'm at the hotel." },
    { parts: 'em + a', answer: 'na', pt: 'Moro ___ Baixa.', en: 'I live downtown.' },
    { parts: 'em + os', answer: 'nos', pt: 'Há muitos turistas ___ museus.', en: 'There are lots of tourists in the museums.' },
    { parts: 'em + as', answer: 'nas', pt: 'Vendem sardinhas ___ festas.', en: 'They sell sardines at the festivals.' },
    { parts: 'em + um', answer: 'num', pt: 'Moro ___ apartamento.', en: 'I live in a flat.' },
    { parts: 'em + uma', answer: 'numa', pt: 'Almoçámos ___ esplanada.', en: 'We had lunch on a café terrace.' },
    { parts: 'em + este', answer: 'neste', pt: 'Fico ___ hotel.', en: "I'm staying in this hotel." },
    { parts: 'em + esse', answer: 'nesse', pt: '___ dia estava a chover.', en: 'That day it was raining.' },
    { parts: 'em + aquele', answer: 'naquele', pt: 'Trabalhava ___ café.', en: 'I used to work in that café.' },
    { parts: 'de + o', answer: 'do', pt: 'Sou ___ Reino Unido.', en: "I'm from the UK." },
    { parts: 'de + a', answer: 'da', pt: 'A casa ___ Ana é perto.', en: "Ana's house is nearby." },
    { parts: 'de + os', answer: 'dos', pt: 'Qual é o preço ___ bilhetes?', en: "What's the price of the tickets?" },
    { parts: 'de + as', answer: 'das', pt: 'Gosto ___ praias.', en: 'I like the beaches.' },
    { parts: 'de + este', answer: 'deste', pt: 'Gosto ___ vinho.', en: 'I like this wine.' },
    { parts: 'de + esse', answer: 'desse', pt: 'Preciso ___ mapa.', en: 'I need that map.' },
    { parts: 'de + ele', answer: 'dele', pt: 'É o carro ___.', en: "It's his car." },
    { parts: 'de + ela', answer: 'dela', pt: 'É a mala ___.', en: "It's her bag." },
    { parts: 'de + aqui', answer: 'daqui', pt: 'É longe ___?', en: 'Is it far from here?' },
    { parts: 'a + o', answer: 'ao', pt: 'Vou ___ museu.', en: "I'm going to the museum." },
    { parts: 'a + a', answer: 'à', pt: 'Vou ___ praia.', en: "I'm going to the beach." },
    { parts: 'a + os', answer: 'aos', pt: 'Vamos ___ Açores.', en: "We're going to the Azores." },
    { parts: 'a + as', answer: 'às', pt: 'O jantar é ___ oito.', en: 'Dinner is at eight.' },
    { parts: 'a + aquele', answer: 'àquele', pt: 'Vamos ___ restaurante.', en: "Let's go to that restaurant." },
    { parts: 'por + o', answer: 'pelo', pt: 'Passamos ___ centro.', en: 'We go through the centre.' },
    { parts: 'por + a', answer: 'pela', pt: 'Obrigado ___ ajuda.', en: 'Thanks for the help.' },
    { parts: 'por + os', answer: 'pelos', pt: 'Obrigado ___ conselhos.', en: 'Thanks for the advice.' },
    { parts: 'por + as', answer: 'pelas', pt: 'Chego ___ dez.', en: "I'll get there around ten." },
  ],


  // SENTENCES (2026-10-11) - whole-sentence examples for the greeting card.
  // Each pattern has hand-picked slot lists so every combination makes sense;
  // the app builds verb forms from the verbs above and does the contractions
  // (a + o = ao, em + a = na…) itself. Nouns that combine with a preposition
  // carry their article (art: 'o' | 'a' | 'os' | 'as' | '' for none).
  // English for each activity: [I/we/they form, he/she form] (routine) or
  // the past sentence. near: true on a place / far: true on a direction keeps
  // "ten minutes' walk" away from the toilet.
  sentences: {
    subjects: [
      { pt: '', p: 0, en: 'I' },            // eu - usually dropped in Portuguese
      { pt: '', p: 3, en: 'we' },           // nós - dropped too
      { pt: 'O João', p: 2, en: 'João' },
      { pt: 'A Ana', p: 2, en: 'Ana' },
      { pt: 'Os meus amigos', p: 4, en: 'my friends' },
    ],
    routine: {
      when: [
        { pt: 'Todos os dias', en: 'Every day' },
        { pt: 'Às vezes', en: 'Sometimes' },
        { pt: 'De manhã', en: 'In the morning' },
        { pt: 'Ao fim de semana', en: 'At weekends' },
        { pt: 'À noite', en: 'In the evening' },
      ],
      activities: [
        { verb: 'tomar', pt: 'um café', en: ['have a coffee', 'has a coffee'] },
        { verb: 'apanhar', pt: 'o autocarro para o trabalho', en: ['catch the bus to work', 'catches the bus to work'] },
        { verb: 'comer', pt: 'na esplanada', en: ['eat on the terrace', 'eats on the terrace'] },
        { verb: 'ler', pt: 'o jornal', en: ['read the paper', 'reads the paper'] },
        { verb: 'estudar', pt: 'português', en: ['study Portuguese', 'studies Portuguese'] },
        { verb: 'jantar', pt: 'com amigos', en: ['have dinner with friends', 'has dinner with friends'] },
        { verb: 'ir', pt: 'ao ginásio', en: ['go to the gym', 'goes to the gym'] },
        { verb: 'trabalhar', pt: 'em casa', en: ['work from home', 'works from home'] },
        { verb: 'beber', pt: 'um galão', en: ['have a milky coffee', 'has a milky coffee'] },
      ],
    },
    going: {
      when: [
        { pt: 'Amanhã', en: 'Tomorrow' },
        { pt: 'No sábado', en: 'On Saturday' },
        { pt: 'Esta tarde', en: 'This afternoon' },
        { pt: 'Logo à noite', en: 'Tonight' },
        { pt: 'Na próxima semana', en: 'Next week' },
      ],
      places: [
        { pt: 'praia', art: 'a', en: 'the beach' },
        { pt: 'museu', art: 'o', en: 'the museum' },
        { pt: 'mercado', art: 'o', en: 'the market' },
        { pt: 'Porto', art: 'o', en: 'Porto' },
        { pt: 'Lisboa', art: '', en: 'Lisbon' },
        { pt: 'Sintra', art: '', en: 'Sintra' },
        { pt: 'castelo', art: 'o', en: 'the castle' },
        { pt: 'Baixa', art: 'a', en: 'the town centre' },
        { pt: 'cinema', art: 'o', en: 'the cinema' },
        { pt: 'Açores', art: 'os', en: 'the Azores' },
      ],
    },
    past: {
      when: [
        { pt: 'Ontem', en: 'Yesterday' },
        { pt: 'Ontem à noite', en: 'Last night' },
        { pt: 'No sábado passado', en: 'Last Saturday' },
        { pt: 'Na semana passada', en: 'Last week' },
      ],
      activities: [
        { verb: 'jantar', pt: 'num restaurante perto do rio', en: 'had dinner at a restaurant near the river' },
        { verb: 'comer', pt: 'bacalhau', en: 'ate salt cod' },
        { verb: 'comer', pt: 'sardinhas assadas', en: 'ate grilled sardines' },
        { verb: 'ver', pt: 'o pôr do sol no miradouro', en: 'watched the sunset from the viewpoint' },
        { verb: 'comprar', pt: 'uma lembrança', en: 'bought a souvenir' },
        { verb: 'apanhar', pt: 'o comboio para Sintra', en: 'caught the train to Sintra' },
        { verb: 'ir', pt: 'ao museu', en: 'went to the museum' },
        { verb: 'ficar', pt: 'em casa', en: 'stayed at home' },
        { verb: 'tomar', pt: 'um café na esplanada', en: 'had a coffee on the terrace' },
        { verb: 'beber', pt: 'vinho verde', en: 'drank vinho verde' },
      ],
    },
    likes: [
      { pt: 'bacalhau', en: 'salt cod' },
      { pt: 'sardinhas', en: 'sardines' },
      { pt: 'pastéis de nata', en: 'custard tarts' },
      { pt: 'vinho verde', en: 'vinho verde' },
      { pt: 'café', en: 'coffee' },
      { pt: 'chá', en: 'tea' },
      { pt: 'marisco', en: 'seafood' },
      { pt: 'futebol', en: 'football' },
      { pt: 'ir à praia', en: 'going to the beach' },
      { pt: 'cozinhar', en: 'cooking' },
      { pt: 'viajar', en: 'travelling' },
      { pt: 'ler', en: 'reading' },
      { pt: 'acordar cedo', en: 'getting up early' },
    ],
    orders: [
      { pt: 'uma bica', en: 'an espresso' },
      { pt: 'um galão', en: 'a milky coffee' },
      { pt: 'uma meia de leite', en: 'a white coffee' },
      { pt: 'um pastel de nata', en: 'a custard tart' },
      { pt: 'uma tosta mista', en: 'a toasted ham and cheese sandwich' },
      { pt: 'um sumo de laranja', en: 'an orange juice' },
      { pt: 'uma água sem gás', en: 'a still water' },
      { pt: 'um copo de vinho tinto', en: 'a glass of red wine' },
      { pt: 'uma imperial', en: 'a small beer' },
      { pt: 'um prego', en: 'a steak sandwich' },
    ],
    orderFrames: [
      { pt: 'Queria {a} e {b}, se faz favor.', en: "I'd like {a} and {b}, please." },
      { pt: 'Para mim, {a}, se faz favor.', en: 'For me, {a}, please.' },
      { pt: 'Pode trazer-me {a}, se faz favor?', en: 'Could you bring me {a}, please?' },
    ],
    whereIs: [
      { pt: 'estação', art: 'a', en: 'the station' },
      { pt: 'museu', art: 'o', en: 'the museum' },
      { pt: 'farmácia', art: 'a', en: 'the chemist' },
      { pt: 'multibanco', art: 'o', en: 'the cash machine', near: true },
      { pt: 'casa de banho', art: 'a', en: 'the toilet', near: true },
      { pt: 'paragem do autocarro', art: 'a', en: 'the bus stop' },
      { pt: 'mercado', art: 'o', en: 'the market' },
    ],
    directions: [
      { pt: 'Fica ao fundo da rua, à esquerda.', en: "It's at the end of the street, on the left." },
      { pt: 'Fica aqui perto, à direita.', en: "It's nearby, on the right." },
      { pt: 'Fica do outro lado da praça.', en: "It's on the other side of the square." },
      { pt: 'Siga sempre em frente, depois do semáforo.', en: 'Carry straight on, past the traffic lights.' },
      { pt: 'Fica em frente da igreja.', en: "It's opposite the church." },
      { pt: 'Fica ao lado do hotel.', en: "It's next to the hotel." },
      { pt: 'Fica a dez minutos a pé.', en: "It's ten minutes' walk.", far: true },
    ],
    opening: [
      { pt: 'museu', art: 'o', en: 'the museum' },
      { pt: 'mercado', art: 'o', en: 'the market' },
      { pt: 'farmácia', art: 'a', en: 'the chemist' },
      { pt: 'castelo', art: 'o', en: 'the castle' },
      { pt: 'loja', art: 'a', en: 'the shop' },
    ],
  },

  // GRAMMAR NOTES - one card each on the Grammar screen. html is shown as-is
  // (simple markup: p, b, i, table.gtable, ul). drill (optional) adds a button:
  // { type: 'verbs', tenses: [...] } or { type: 'contractions' }.
  notes: [
    {
      id: 'present', title: 'Present tense: the regular endings',
      drill: { type: 'verbs', tenses: ['pres'] },
      html: `
<p>Take off <b>-ar</b>, <b>-er</b> or <b>-ir</b> and add the ending for the person. Three patterns cover most verbs.</p>
<table class="gtable"><tr><th></th><th>falar</th><th>comer</th><th>abrir</th></tr>
<tr><td>eu</td><td>fal<b>o</b></td><td>com<b>o</b></td><td>abr<b>o</b></td></tr>
<tr><td>tu</td><td>fal<b>as</b></td><td>com<b>es</b></td><td>abr<b>es</b></td></tr>
<tr><td>ele / ela / você</td><td>fal<b>a</b></td><td>com<b>e</b></td><td>abr<b>e</b></td></tr>
<tr><td>nós</td><td>fal<b>amos</b></td><td>com<b>emos</b></td><td>abr<b>imos</b></td></tr>
<tr><td>eles / elas / vocês</td><td>fal<b>am</b></td><td>com<b>em</b></td><td>abr<b>em</b></td></tr></table>
<p><b>Rules worth knowing:</b></p>
<ul>
<li><b>eu</b> always ends in <b>-o</b> for regular verbs. The irregulars are mostly irregular <i>only</i> in the eu form: <i>faço, digo, tenho, venho, posso, sei, vejo, peço, ouço, durmo, conheço, trago, ponho</i>.</li>
<li><b>você</b>, <b>o senhor</b> and <b>a senhora</b> all take the ele/ela form: <i>você fala inglês?</i></li>
<li>-er and -ir only differ in the nós form: <i>comemos</i> / <i>abrimos</i>.</li>
<li>The present also covers the near future, as in English: <i>amanhã trabalho</i> - I'm working tomorrow.</li>
</ul>`,
    },
    {
      id: 'past', title: 'Past tense: what happened (pretérito perfeito)',
      drill: { type: 'verbs', tenses: ['pret'] },
      html: `
<p>For finished actions: <i>ontem comi bacalhau</i> - yesterday I ate salt cod.</p>
<table class="gtable"><tr><th></th><th>falar</th><th>comer</th><th>abrir</th></tr>
<tr><td>eu</td><td>fal<b>ei</b></td><td>com<b>i</b></td><td>abr<b>i</b></td></tr>
<tr><td>tu</td><td>fal<b>aste</b></td><td>com<b>este</b></td><td>abr<b>iste</b></td></tr>
<tr><td>ele / ela / você</td><td>fal<b>ou</b></td><td>com<b>eu</b></td><td>abr<b>iu</b></td></tr>
<tr><td>nós</td><td>fal<b>ámos</b></td><td>com<b>emos</b></td><td>abr<b>imos</b></td></tr>
<tr><td>eles / elas / vocês</td><td>fal<b>aram</b></td><td>com<b>eram</b></td><td>abr<b>iram</b></td></tr></table>
<ul>
<li><b>Portugal only:</b> the -ar nós past has an accent, <i>falámos</i> (we spoke), to tell it apart from the present <i>falamos</i> (we speak). Brazil writes both as falamos.</li>
<li><b>Spelling changes in the eu form</b>, to keep the sound: -car → <b>-quei</b> (<i>fiquei</i>), -gar → <b>-guei</b> (<i>paguei, cheguei</i>), -çar → <b>-cei</b> (<i>comecei, almocei</i>).</li>
<li><b>ser</b> and <b>ir</b> share one past: <i>fui</i> = I was / I went. Context tells you which.</li>
<li>The common irregulars: <i>tive, estive, fiz, disse, pude, quis, soube, vi, vim, dei, pus, trouxe</i>.</li>
</ul>`,
    },
    {
      id: 'imperfect', title: 'Was doing / used to (imperfeito)',
      drill: { type: 'verbs', tenses: ['imp'] },
      html: `
<p>For background, habits and descriptions in the past: <i>quando era pequeno, morava em Glasgow</i> - when I was little, I lived in Glasgow.</p>
<table class="gtable"><tr><th></th><th>falar</th><th>comer / abrir</th></tr>
<tr><td>eu</td><td>fal<b>ava</b></td><td>com<b>ia</b></td></tr>
<tr><td>tu</td><td>fal<b>avas</b></td><td>com<b>ias</b></td></tr>
<tr><td>ele / ela / você</td><td>fal<b>ava</b></td><td>com<b>ia</b></td></tr>
<tr><td>nós</td><td>fal<b>ávamos</b></td><td>com<b>íamos</b></td></tr>
<tr><td>eles / elas / vocês</td><td>fal<b>avam</b></td><td>com<b>iam</b></td></tr></table>
<ul>
<li>Only four irregulars: <i>era</i> (ser), <i>tinha</i> (ter), <i>vinha</i> (vir), <i>punha</i> (pôr).</li>
<li><b>Past or imperfect?</b> The past is the event; the imperfect is the scene around it: <i>estava a chover quando cheguei</i> - it was raining when I arrived.</li>
<li><b>Very common in Portugal:</b> the imperfect is used to make polite requests: <i>queria um café</i>, <i>gostava de uma mesa para dois</i> - I'd like…</li>
</ul>`,
    },
    {
      id: 'progressive', title: 'Right now: estar a + infinitive',
      drill: { type: 'verbs', tenses: ['prog'] },
      html: `
<p>For something happening at this moment, Portugal uses <b>estar a</b> + the infinitive:</p>
<p><i>estou a comer</i> - I'm eating &nbsp;·&nbsp; <i>está a chover</i> - it's raining &nbsp;·&nbsp; <i>estamos a aprender</i> - we're learning</p>
<ul>
<li>Only estar changes; the infinitive stays as it is.</li>
<li><b>Brazil</b> says it with the -ndo form instead: <i>estou comendo</i>. You'll understand both; in Portugal use estar a.</li>
<li>It works in the past too, with the imperfect of estar: <i>estava a dormir</i> - I was sleeping.</li>
<li>Verbs of state don't usually take it: <i>sei</i>, not <i>estou a saber</i>.</li>
</ul>`,
    },
    {
      id: 'future', title: 'Going to: ir + infinitive',
      drill: { type: 'verbs', tenses: ['fut'] },
      html: `
<p>The everyday future: the present of <b>ir</b> + the infinitive.</p>
<p><i>vou comer</i> - I'm going to eat &nbsp;·&nbsp; <i>vamos ao Porto</i> - we're going to Porto &nbsp;·&nbsp; <i>vai chover</i> - it's going to rain</p>
<table class="gtable"><tr><td>eu</td><td><b>vou</b> falar</td></tr><tr><td>tu</td><td><b>vais</b> falar</td></tr><tr><td>ele / ela / você</td><td><b>vai</b> falar</td></tr><tr><td>nós</td><td><b>vamos</b> falar</td></tr><tr><td>eles / elas / vocês</td><td><b>vão</b> falar</td></tr></table>
<ul>
<li>One verb to learn and you have a future for every verb.</li>
<li><i>vamos!</i> on its own is "let's go"; <i>vamos comer</i> can be "let's eat".</li>
</ul>`,
    },
    {
      id: 'ser-estar', title: 'ser or estar?',
      drill: { type: 'verbs', tenses: ['pres', 'pret', 'imp'], verbs: ['ser', 'estar'] },
      html: `
<p>Both mean "to be". The rule of thumb:</p>
<ul>
<li><b>ser</b> - what something <i>is</i>: identity, origin, job, nationality, time, what it's made of. <i>Sou do Reino Unido. É médica. São três horas. É de madeira.</i></li>
<li><b>estar</b> - how or where something is <i>at the moment</i>: states, feelings, weather, temporary location. <i>Estou cansado. Está calor. Estamos no hotel.</i></li>
</ul>
<p><b>Changes of meaning:</b> <i>é bonito</i> (it's a pretty thing) vs <i>está bonito</i> (it looks nice today); <i>ele é chato</i> (he's annoying) vs <i>ele está chateado</i> (he's annoyed).</p>
<p><b>Where things are permanently</b> usually takes <b>ficar</b>: <i>onde fica o museu?</i> - where is the museum?</p>`,
    },
    {
      id: 'contractions', title: 'Contractions: no, na, do, ao, pelo…',
      drill: { type: 'contractions' },
      html: `
<p>Four short prepositions merge with the word after them. These aren't optional - <i>em o hotel</i> is wrong; it has to be <i>no hotel</i>.</p>
<table class="gtable"><tr><th></th><th>o</th><th>a</th><th>os</th><th>as</th><th>um / uma</th></tr>
<tr><td><b>em</b> (in, at, on)</td><td>no</td><td>na</td><td>nos</td><td>nas</td><td>num / numa</td></tr>
<tr><td><b>de</b> (of, from)</td><td>do</td><td>da</td><td>dos</td><td>das</td><td>dum / duma*</td></tr>
<tr><td><b>a</b> (to, at)</td><td>ao</td><td>à</td><td>aos</td><td>às</td><td>-</td></tr>
<tr><td><b>por</b> (by, through, for)</td><td>pelo</td><td>pela</td><td>pelos</td><td>pelas</td><td>-</td></tr></table>
<ul>
<li>They also merge with <i>este, esse, aquele</i>: <i>neste, desse, naquele, àquele</i>, and with <i>ele/ela</i>: <i>dele</i> (his), <i>dela</i> (her).</li>
<li><b>à</b> with an accent is a + a: <i>vou à praia</i>. Plain <b>a</b> is just "the" or "to".</li>
<li><b>às</b> + hour = at: <i>às oito</i>. <b>pelas</b> + hour = around: <i>pelas oito</i>.</li>
<li>* dum / duma are common in speech; in writing <i>de um</i> is also fine.</li>
</ul>`,
    },
    {
      id: 'pronouns', title: 'Where me, te, se go',
      html: `
<p>The little object pronouns (<i>me, te, se, o, a, lhe, nos</i>) are the clearest Portugal / Brazil difference.</p>
<p><b>Portugal: after the verb, with a hyphen</b> - <i>chamo-me Andrew</i>, <i>ajude-me</i>, <i>diga-me</i>.</p>
<p><b>But before the verb</b> after these:</p>
<ul>
<li><b>não</b> and other negatives: <i>não me lembro</i> - I don't remember</li>
<li><b>question words</b>: <i>como se chama?</i>, <i>onde se compra?</i></li>
<li><b>que</b>, and words like <i>também, já, ainda, sempre, só, todos</i>: <i>também me chamo João</i>, <i>já te disse</i></li>
</ul>
<p><b>Brazil</b> mostly puts them before: <i>me chamo, me ajuda</i>. Both are understood, but chamo-me is what you'll hear in Portugal.</p>`,
    },
    {
      id: 'address', title: 'tu, você, o senhor',
      html: `
<ul>
<li><b>tu</b> - friends, family, children, people your age in casual settings. Verb in the tu form: <i>tu falas</i>.</li>
<li><b>o senhor / a senhora</b> - the polite way to address a stranger, an older person, a shopkeeper: <i>o senhor sabe onde fica…?</i> Verb in the ele/ela form.</li>
<li><b>você</b> - neutral in Brazil, but in Portugal it can feel a bit blunt to someone's face. Most people avoid the word and just use the verb: <i>sabe onde fica…?</i></li>
<li><b>vocês</b> - "you" to more than one person, in both countries. Verb in the eles/elas form.</li>
</ul>
<p>If unsure, drop the pronoun and use the ele/ela form of the verb - polite and natural: <i>fala inglês?</i></p>`,
    },
    {
      id: 'agreement', title: 'Gender, plurals and agreement',
      html: `
<ul>
<li>Every noun is masculine (<b>o</b>) or feminine (<b>a</b>). Most -o words are masculine, most -a words feminine - but learn the article with the word: <i>o dia, o mapa, a mão, a viagem</i>.</li>
<li>Words ending <b>-ção, -dade, -gem</b> are feminine: <i>a estação, a cidade, a viagem</i>.</li>
<li>Adjectives agree with the noun: <i>o vinho tinto, a casa pequena, os bolos bons</i>. Adjectives ending in -e don't change for gender: <i>grande, quente</i>.</li>
<li>Plurals usually add <b>-s</b>. Endings to know: -m → -ns (<i>homens</i>), -l → -is (<i>espanhóis</i>), -r / -z → -res / -zes (<i>mulheres, luzes</i>), and -ão → -ões / -ães / -ãos (<i>estações, pães, mãos</i>) - the -ão plurals have to be learnt.</li>
</ul>`,
    },
  ],
};
