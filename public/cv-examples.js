// Original fictional profiles informed by public CV-writing guidance:
// https://careerservices.fas.harvard.edu/blog/2025/08/14/45-rare-action-verbs-for-your-resume-with-examples/
// https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume
// All employers, names and results below are illustrative, not real testimonials.
const examples = [
  {
    id: 'marketing', style: 'ats', accent: '#c1d5ac',
    hu: {
      category: 'Marketing', label: 'Marketing specialist', note: 'Kampányok és mérhető növekedés',
      result: 'Példa eredmény: +32% minősített érdeklődő',
      cv: {
        name: 'Kovács Anna', title: 'Marketing specialist', email: 'anna@example.com',
        phone: '+36 30 000 0000', city: 'Budapest', link: 'linkedin.com/in/pelda-anna',
        summary: 'Adatalapú marketing szakember 4 év tapasztalattal. Tartalomstratégiát, kampányokat és konverziómérést kapcsolok össze, hogy a csapat világos célok mentén növekedjen.',
        experience: [
          {heading:'Marketing specialist', organization:'Fiktív Kreatív Stúdió', location:'Budapest', dates:'2022 – jelenleg', details:'Összehangoltam az e-mail és keresőkampányokat; a mintaprojektben 32%-kal nőtt a minősített érdeklődők száma.\nHeti riportokat vezettem be, és A/B tesztekkel javítottam a landolóoldalak teljesítményét.'},
          {heading:'Marketing koordinátor', organization:'Példa Márka', location:'Budapest', dates:'2020 – 2022', details:'Tartalomnaptárt és 3 csatornás kampányokat szerveztem a kreatív és értékesítési csapattal.'}
        ],
        education:[{heading:'Kommunikáció és médiatudomány BA',organization:'Példa Egyetem',location:'Budapest',dates:'2017 – 2020',details:''}],
        skills:'Google Analytics 4 · kampánytervezés · SEO · A/B tesztelés · Excel',
        languages:'Magyar\nAngol', languageLevels:[5,4]
      }
    },
    en: {
      category: 'Marketing', label: 'Marketing specialist', note: 'Campaigns and measurable growth',
      result: 'Example outcome: +32% qualified leads',
      cv: {
        name:'Anna Kovacs',title:'Marketing Specialist',email:'anna@example.com',
        phone:'+44 7700 900000',city:'London',link:'linkedin.com/in/example-anna',
        summary:'Data-led marketing specialist with four years of experience connecting content, campaigns and conversion reporting to clear business goals.',
        experience:[
          {heading:'Marketing Specialist',organization:'Fictional Creative Studio',location:'London',dates:'2022 – Present',details:'Coordinated email and search campaigns; in this illustrative project, qualified leads increased by 32%.\nIntroduced weekly reporting and tested landing-page variants to improve conversion.'},
          {heading:'Marketing Coordinator',organization:'Example Brand',location:'London',dates:'2020 – 2022',details:'Managed a content calendar and three-channel campaigns with creative and sales teams.'}
        ],
        education:[{heading:'BA Communication & Media',organization:'Example University',location:'London',dates:'2017 – 2020',details:''}],
        skills:'Google Analytics 4 · campaign planning · SEO · A/B testing · Excel',
        languages:'English\nGerman',languageLevels:[5,3]
      }
    }
  },
  {
    id:'developer',style:'tech',accent:'#a8cfc5',
    hu:{
      category:'Technológia',label:'Szoftverfejlesztő',note:'Terméképítés és teljesítmény',
      result:'Példa eredmény: 40%-kal gyorsabb betöltés',
      cv:{
        name:'Nagy Bence',title:'Full-stack fejlesztő',email:'bence@example.com',phone:'+36 30 000 0000',city:'Szeged',link:'github.com/pelda-bence',
        summary:'Full-stack fejlesztő 5 év tapasztalattal. Karbantartható webes termékeket építek, és mérhetően javítom a felhasználói élményt.',
        experience:[
          {heading:'Full-stack fejlesztő',organization:'Minta Digital',location:'Budapest',dates:'2021 – jelenleg',details:'React és Node.js alapú ügyfélportált építettem; az illusztratív projektben a főoldal betöltése 40%-kal gyorsult.\nAutomatizált tesztekkel és kódreview-val csökkentettem a visszatérő hibákat.'},
          {heading:'Frontend fejlesztő',organization:'Demo Labs',location:'Szeged',dates:'2019 – 2021',details:'Reszponzív komponenseket és hozzáférhető űrlapokat fejlesztettem terméktervezőkkel együtt.'}
        ],
        education:[{heading:'Programtervező informatikus BSc',organization:'Példa Egyetem',location:'Szeged',dates:'2016 – 2019',details:''}],
        skills:'TypeScript · React · Node.js · PostgreSQL · tesztelés · Git',languages:'Magyar\nAngol',languageLevels:[5,4]
      }
    },
    en:{
      category:'Technology',label:'Software engineer',note:'Products and performance',
      result:'Example outcome: 40% faster load time',
      cv:{
        name:'Ben Nagy',title:'Full-stack Software Engineer',email:'ben@example.com',phone:'+44 7700 900000',city:'Manchester',link:'github.com/example-ben',
        summary:'Full-stack engineer with five years of experience building maintainable web products and improving the user experience through measurable changes.',
        experience:[
          {heading:'Full-stack Engineer',organization:'Sample Digital',location:'Manchester',dates:'2021 – Present',details:'Built a React and Node.js customer portal; in this illustrative project, landing-page load time improved by 40%.\nAdded automated tests and code reviews to reduce recurring defects.'},
          {heading:'Frontend Developer',organization:'Demo Labs',location:'Leeds',dates:'2019 – 2021',details:'Developed responsive components and accessible forms in partnership with product designers.'}
        ],
        education:[{heading:'BSc Computer Science',organization:'Example University',location:'Leeds',dates:'2016 – 2019',details:''}],
        skills:'TypeScript · React · Node.js · PostgreSQL · testing · Git',languages:'English\nSpanish',languageLevels:[5,3]
      }
    }
  },
  {
    id:'project',style:'professional',accent:'#c9d5b9',
    hu:{
      category:'Menedzsment',label:'Projektmenedzser',note:'Csapatok és határidők',
      result:'Példa eredmény: 6 projekt határidőre',
      cv:{
        name:'Szabó Dóra',title:'Projektmenedzser',email:'dora@example.com',phone:'+36 30 000 0000',city:'Budapest',link:'linkedin.com/in/pelda-dora',
        summary:'Projektmenedzser 6 év tapasztalattal, digitális bevezetések és több szakterületet összefogó csapatok koordinálásában.',
        experience:[
          {heading:'Projektmenedzser',organization:'Fiktív Solutions',location:'Budapest',dates:'2021 – jelenleg',details:'6 párhuzamos bevezetést ütemeztem és követtem végig a mintaprojektben, mindet határidőre zártuk.\nEgységes státuszriportot és kockázatkezelési folyamatot alakítottam ki.'},
          {heading:'Projektkoordinátor',organization:'Minta Csoport',location:'Budapest',dates:'2018 – 2021',details:'Ügyfélkommunikációt, költségkereteket és feladatlistákat követtem 12 fős csapat számára.'}
        ],
        education:[{heading:'Gazdálkodási és menedzsment BA',organization:'Példa Egyetem',location:'Budapest',dates:'2015 – 2018',details:''}],
        skills:'Ütemezés · stakeholder-kezelés · Agile · Jira · költségtervezés',languages:'Magyar\nAngol',languageLevels:[5,4]
      }
    },
    en:{
      category:'Management',label:'Project manager',note:'Teams and delivery',
      result:'Example outcome: 6 projects on time',
      cv:{
        name:'Dora Szabo',title:'Project Manager',email:'dora@example.com',phone:'+44 7700 900000',city:'London',link:'linkedin.com/in/example-dora',
        summary:'Project manager with six years of experience coordinating digital launches and multidisciplinary teams from planning to delivery.',
        experience:[
          {heading:'Project Manager',organization:'Fictional Solutions',location:'London',dates:'2021 – Present',details:'Scheduled and delivered six concurrent launches on time in this illustrative project.\nIntroduced a shared status report and risk-management process.'},
          {heading:'Project Coordinator',organization:'Sample Group',location:'London',dates:'2018 – 2021',details:'Tracked client communications, budgets and deliverables for a 12-person team.'}
        ],
        education:[{heading:'BA Business Management',organization:'Example University',location:'London',dates:'2015 – 2018',details:''}],
        skills:'Scheduling · stakeholder management · Agile · Jira · budgeting',languages:'English\nFrench',languageLevels:[5,3]
      }
    }
  },
  {
    id:'finance',style:'executive',accent:'#d8cbb5',
    hu:{
      category:'Pénzügy',label:'Pénzügyi elemző',note:'Pontosság és üzleti döntések',
      result:'Példa eredmény: 25%-kal rövidebb riportidő',
      cv:{
        name:'Tóth Márton',title:'Pénzügyi elemző',email:'marton@example.com',phone:'+36 30 000 0000',city:'Budapest',link:'linkedin.com/in/pelda-marton',
        summary:'Pénzügyi elemző 4 év tapasztalattal. Közérthető pénzügyi modellekkel és automatizált riportokkal támogatom a döntéshozatalt.',
        experience:[
          {heading:'Pénzügyi elemző',organization:'Fiktív Finance',location:'Budapest',dates:'2022 – jelenleg',details:'Automatizáltam a havi vezetői riportok előkészítését; a mintaprojektben a ráfordított idő 25%-kal csökkent.\nEltéréselemzésekkel támogattam a tervezést és az előrejelzést.'},
          {heading:'Junior kontroller',organization:'Példa Kft.',location:'Budapest',dates:'2020 – 2022',details:'Költséghelyi adatok egyeztetését és havi zárási feladatokat végeztem.'}
        ],
        education:[{heading:'Pénzügy és számvitel BSc',organization:'Példa Egyetem',location:'Budapest',dates:'2017 – 2020',details:''}],
        skills:'Excel · Power BI · pénzügyi modellezés · előrejelzés · SQL',languages:'Magyar\nAngol',languageLevels:[5,4]
      }
    },
    en:{
      category:'Finance',label:'Financial analyst',note:'Clarity for better decisions',
      result:'Example outcome: 25% less reporting time',
      cv:{
        name:'Martin Toth',title:'Financial Analyst',email:'martin@example.com',phone:'+44 7700 900000',city:'London',link:'linkedin.com/in/example-martin',
        summary:'Financial analyst with four years of experience supporting decisions through clear models, reliable forecasts and automated reporting.',
        experience:[
          {heading:'Financial Analyst',organization:'Fictional Finance',location:'London',dates:'2022 – Present',details:'Automated monthly management reports; in this illustrative project, preparation time fell by 25%.\nProvided variance analysis to support planning and forecasts.'},
          {heading:'Junior Controller',organization:'Example Ltd',location:'London',dates:'2020 – 2022',details:'Reconciled cost-centre data and supported month-end closing.'}
        ],
        education:[{heading:'BSc Finance & Accounting',organization:'Example University',location:'London',dates:'2017 – 2020',details:''}],
        skills:'Excel · Power BI · financial modelling · forecasting · SQL',languages:'English\nGerman',languageLevels:[5,3]
      }
    }
  },
  {
    id:'support',style:'modern',accent:'#c6d6d0',
    hu:{
      category:'Ügyfélkapcsolat',label:'Ügyfélszolgálati munkatárs',note:'Emberek és megoldások',
      result:'Példa eredmény: 95% elégedettség',
      cv:{
        name:'Farkas Réka',title:'Ügyfélszolgálati munkatárs',email:'reka@example.com',phone:'+36 30 000 0000',city:'Debrecen',link:'linkedin.com/in/pelda-reka',
        summary:'Empatikus ügyfélkapcsolati szakember 3 év tapasztalattal. Gyors, pontos és személyre szabott segítséget nyújtok digitális csatornákon.',
        experience:[
          {heading:'Ügyfélszolgálati munkatárs',organization:'Minta Service',location:'Debrecen',dates:'2022 – jelenleg',details:'Napi 35–40 ügyet kezeltem e-mailen és chaten; a mintaprojektben 95%-os ügyfélelégedettséget ért el a csapat.\nÚj tudásbázis-cikkeket írtam a visszatérő kérdésekhez.'},
          {heading:'Ügyfélkapcsolati asszisztens',organization:'Példa Üzlet',location:'Debrecen',dates:'2020 – 2022',details:'Rendelésekkel kapcsolatos kérdéseket oldottam meg, és pontosan dokumentáltam az eseteket.'}
        ],
        education:[{heading:'Kereskedelem és marketing BA',organization:'Példa Egyetem',location:'Debrecen',dates:'2017 – 2020',details:''}],
        skills:'Ügyfélkommunikáció · problémamegoldás · CRM · Zendesk · dokumentáció',languages:'Magyar\nAngol',languageLevels:[5,4]
      }
    },
    en:{
      category:'Customer care',label:'Customer support specialist',note:'People and solutions',
      result:'Example outcome: 95% satisfaction',
      cv:{
        name:'Reka Farkas',title:'Customer Support Specialist',email:'reka@example.com',phone:'+44 7700 900000',city:'Bristol',link:'linkedin.com/in/example-reka',
        summary:'Empathetic support specialist with three years of experience providing fast, accurate help across digital channels.',
        experience:[
          {heading:'Customer Support Specialist',organization:'Sample Service',location:'Bristol',dates:'2022 – Present',details:'Handled 35–40 email and chat cases daily; the team reached 95% customer satisfaction in this illustrative project.\nWrote knowledge-base articles for recurring questions.'},
          {heading:'Customer Care Assistant',organization:'Example Store',location:'Bristol',dates:'2020 – 2022',details:'Resolved order queries and documented cases accurately.'}
        ],
        education:[{heading:'BA Business & Marketing',organization:'Example University',location:'Bristol',dates:'2017 – 2020',details:''}],
        skills:'Customer communication · problem solving · CRM · Zendesk · documentation',languages:'English\nItalian',languageLevels:[5,3]
      }
    }
  },
  {
    id:'graduate',style:'minimal',accent:'#d8d9c6',
    hu:{
      category:'Pályakezdő',label:'Junior adatelemző',note:'Projektekből első karrier',
      result:'Példa eredmény: 3 önálló elemzési projekt',
      cv:{
        name:'Varga Levente',title:'Junior adatelemző',email:'levente@example.com',phone:'+36 30 000 0000',city:'Pécs',link:'github.com/pelda-levente',
        summary:'Pályakezdő adatelemző vagyok. Egyetemi és saját projekteken keresztül szereztem tapasztalatot az adattisztításban és az eredmények érthető bemutatásában.',
        experience:[{heading:'Adatelemző gyakornok',organization:'Fiktív Insight',location:'Pécs',dates:'2025 – 2026',details:'Heti riportokhoz tisztítottam adatokat, és a csapat számára könnyen használható dashboardokat készítettem.'}],
        education:[{heading:'Gazdaságinformatikus BSc',organization:'Példa Egyetem',location:'Pécs',dates:'2022 – 2026',details:'Szakdolgozat: értékesítési adatok vizualizációja.'}],
        projects:[{heading:'Nyílt adatok elemzése',organization:'Önálló portfólió',location:'',dates:'2025 – 2026',details:'3 saját elemzési projektben adatokat tisztítottam, vizualizáltam és rövid következtetéseket írtam.'}],
        skills:'Excel · SQL · Python · Power BI · adatvizualizáció',languages:'Magyar\nAngol',languageLevels:[5,4]
      }
    },
    en:{
      category:'Early career',label:'Junior data analyst',note:'Projects into a first career',
      result:'Example outcome: 3 portfolio projects',
      cv:{
        name:'Leo Varga',title:'Junior Data Analyst',email:'leo@example.com',phone:'+44 7700 900000',city:'Birmingham',link:'github.com/example-leo',
        summary:'Early-career data analyst with practical experience cleaning data and explaining findings through university and independent projects.',
        experience:[{heading:'Data Analyst Intern',organization:'Fictional Insight',location:'Birmingham',dates:'2025 – 2026',details:'Cleaned data for weekly reports and created easy-to-use dashboards for the team.'}],
        education:[{heading:'BSc Business Information Systems',organization:'Example University',location:'Birmingham',dates:'2022 – 2026',details:'Dissertation: visualising sales data.'}],
        projects:[{heading:'Open Data Analysis',organization:'Independent portfolio',location:'',dates:'2025 – 2026',details:'Cleaned, visualised and explained data across three self-directed analysis projects.'}],
        skills:'Excel · SQL · Python · Power BI · data visualisation',languages:'English\nFrench',languageLevels:[5,3]
      }
    }
  }
];

export function getCvExamples(lang) {
  const locale = lang === 'hu' ? 'hu' : 'en';
  return examples.map(({id, style, accent, ...copy}) => ({id, style, accent, ...copy[locale]}));
}

export function getCvExample(id, lang) {
  return getCvExamples(lang).find(example => example.id === id);
}