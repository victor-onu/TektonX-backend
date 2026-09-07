// Auto-generated from TektonX_12_Week_Mentor_Timetable.xlsx
// Cohort dates: Mon 25 May 2026 -> Sun 16 Aug 2026 (West Africa Time)

export interface WeekContent {
  week: number;
  dates: string;
  topic: string;
  task: string;
  resource: string;
  resourceUrl: string | null;
}

export interface ProgramEvent {
  week: number;
  dates: string;
  title: string;
  schedule: string;
}

export const CURRICULUM_COHORT_START = '2026-05-25';
export const CURRICULUM_COHORT_END = '2026-08-16';
export const CURRICULUM_TIMEZONE = 'Africa/Lagos';

export const PROGRAM_EVENTS: ProgramEvent[] = [
  {
    week: 3,
    dates: '8 Jun – 14 Jun',
    title:
      'AI Session #1 (All Tracks) – Intro to AI & how it shapes every tech role',
    schedule: '📅 Fri 12 Jun 2026  •  🕗 8:00 PM WAT\n💻 Zoom / Google Meet',
  },
  {
    week: 4,
    dates: '15 Jun – 21 Jun',
    title: 'Milestone 1 Review – Foundations check-in (all tracks)',
    schedule: '📅 Sat 20 Jun 2026  •  🕗 8:00 PM WAT\n💻 Zoom / Google Meet',
  },
  {
    week: 7,
    dates: '6 Jul – 12 Jul',
    title:
      'AI Session #2 (All Tracks) – Using AI tools in your track (ChatGPT, Claude, Copilot, Figma AI, etc.)',
    schedule: '📅 Fri 10 Jul 2026  •  🕗 8:00 PM WAT\n💻 Zoom / Google Meet',
  },
  {
    week: 8,
    dates: '13 Jul – 19 Jul',
    title:
      'Milestone 2 Review – Mid-program Demo Day (all tracks present progress)',
    schedule: '📅 Sat 18 Jul 2026  •  🕗 8:00 PM WAT\n💻 Zoom / Google Meet',
  },
  {
    week: 9,
    dates: '20 Jul – 26 Jul',
    title:
      'Mid-program Bonding & Meetup – Virtual hangout, games & fun moments',
    schedule:
      '📅 Sat 25 Jul 2026  •  🕗 7:00 PM WAT\n💻 Zoom / Google Meet (icebreakers + games)',
  },
  {
    week: 11,
    dates: '3 Aug – 9 Aug',
    title:
      'AI Session #3 (All Tracks) – Building with AI: practical workflows for your portfolio',
    schedule: '📅 Fri 7 Aug 2026  •  🕗 8:00 PM WAT\n💻 Zoom / Google Meet',
  },
  {
    week: 12,
    dates: '10 Aug – 16 Aug',
    title: 'Final Showcase + Graduation Ceremony + Testimonials',
    schedule:
      '📅 Sat 15 Aug 2026  •  🕗 8:00 PM WAT\n💻 Zoom / Google Meet (recorded)',
  },
];

export const TRACK_CURRICULUM: Record<string, WeekContent[]> = {
  'Software Development (Frontend & Backend)': [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'HTML structure & semantic tags',
      task: 'Build a basic HTML page about yourself',
      resource: 'freeCodeCamp – Responsive Web Design',
      resourceUrl:
        'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'CSS styling, layout & Flexbox',
      task: 'Style your page with custom CSS',
      resource: 'MDN Web Docs – CSS Basics',
      resourceUrl:
        'https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'JavaScript fundamentals (vars, functions, DOM)',
      task: 'Add interactivity (button, form validation)',
      resource: 'JavaScript.info – The Modern JS Tutorial',
      resourceUrl: 'https://javascript.info/',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Responsive design & Git basics',
      task: 'Publish static portfolio page to GitHub',
      resource: 'GitHub Docs – Getting started',
      resourceUrl: 'https://docs.github.com/en/get-started',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Intro to backend & Node.js (or Python/PHP)',
      task: 'Run your first server, return JSON',
      resource: 'Node.js Learn / FastAPI Quickstart',
      resourceUrl:
        'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'REST APIs & HTTP methods (GET/POST/PUT/DEL)',
      task: 'Build a REST API for a notes resource',
      resource: 'Postman Learning Center',
      resourceUrl: 'https://learning.postman.com/docs/introduction/overview/',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Databases (SQLite/MongoDB) & CRUD',
      task: 'Persist notes in a database',
      resource: 'SQLBolt – Interactive SQL lessons',
      resourceUrl: 'https://sqlbolt.com/',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'Authentication basics & error handling',
      task: 'Add simple login/signup to API',
      resource: 'JWT.io – Introduction',
      resourceUrl: 'https://jwt.io/introduction',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Connecting frontend to backend (fetch/axios)',
      task: 'Wire your frontend to your CRUD API',
      resource: 'MDN – Using the Fetch API',
      resourceUrl:
        'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'Environment variables, testing & debugging',
      task: 'Add .env config and basic tests',
      resource: 'dotenv on npm',
      resourceUrl: 'https://www.npmjs.com/package/dotenv',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'Deployment (Render, Netlify, Vercel)',
      task: 'Deploy backend + frontend live',
      resource: 'Render Docs – Deploy a Web Service',
      resourceUrl: 'https://render.com/docs/deploy-node-express-app',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'Polish, README & final demo',
      task: 'Submit live link + GitHub repo + demo',
      resource: 'Make a README – Guide',
      resourceUrl: 'https://www.makeareadme.com/',
    },
  ],
  'UI/UX Design': [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'What is UX? Design thinking & user research',
      task: 'Interview 2 users about a daily app they use',
      resource: 'IDEO Design Kit – Methods',
      resourceUrl: 'https://www.designkit.org/methods.html',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'Color theory & typography',
      task: 'Build a mini style guide (palette + fonts)',
      resource: 'Refactoring UI – Free chapters & blog',
      resourceUrl: 'https://www.refactoringui.com/',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'Visual hierarchy & layout principles',
      task: 'Sketch UI for 2 popular apps (paper)',
      resource: 'Laws of UX',
      resourceUrl: 'https://lawsofux.com/',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Heuristic evaluation & competitor analysis',
      task: 'Heuristic review of an existing app',
      resource: 'NN/g – 10 Usability Heuristics',
      resourceUrl: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Intro to Figma – frames, shapes, components',
      task: 'Recreate a simple screen in Figma',
      resource: 'Figma Learn – Getting Started',
      resourceUrl:
        'https://help.figma.com/hc/en-us/categories/360002051613-Getting-started',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'Wireframing low-fidelity flows',
      task: 'Low-fi wireframes for a food delivery flow',
      resource: 'Figma Community – Wireframe Kits',
      resourceUrl:
        'https://www.figma.com/community/search?resource_type=files&q=wireframe%20kit',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Design systems, auto layout & variants',
      task: 'Build a reusable button + card component',
      resource: 'Figma – Auto Layout guide',
      resourceUrl:
        'https://help.figma.com/hc/en-us/articles/360040451373-Create-dynamic-designs-with-auto-layout',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'High-fidelity mockups & accessibility',
      task: 'Convert wireframes to high-fi screens',
      resource: 'WCAG Quick Reference',
      resourceUrl: 'https://www.w3.org/WAI/WCAG21/quickref/',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Prototyping & micro-interactions in Figma',
      task: 'Add clickable flow to your hi-fi design',
      resource: 'Figma – Prototyping basics',
      resourceUrl:
        'https://help.figma.com/hc/en-us/categories/360002051613-Prototyping',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'User testing basics',
      task: 'Test prototype with 3 users, log feedback',
      resource: 'Maze – User testing guides',
      resourceUrl: 'https://maze.co/guides/',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'Iteration & portfolio case study writing',
      task: 'Write a 1-page case study of your project',
      resource: 'Bestfolios – Case study examples',
      resourceUrl: 'https://www.bestfolios.com/casestudies',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'Present & defend design decisions',
      task: 'Live prototype walkthrough + Q&A',
      resource: 'NN/g – Presenting UX work',
      resourceUrl: 'https://www.nngroup.com/articles/presenting-ux-work/',
    },
  ],
  'Mobile App Development': [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'Setup: Flutter or React Native + emulator',
      task: 'Install tools, run sample app',
      resource: 'Flutter – Get Started',
      resourceUrl: 'https://docs.flutter.dev/get-started/install',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'Dart/JS basics & widget/component tree',
      task: "Build a 'Hello World' + calculator",
      resource: 'Flutter Codelabs',
      resourceUrl: 'https://docs.flutter.dev/codelabs',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'Layouts, styling & assets',
      task: 'Style calculator with custom theme',
      resource: 'Flutter Cookbook',
      resourceUrl: 'https://docs.flutter.dev/cookbook',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Forms, inputs & validation',
      task: 'Build a sign-up screen with validation',
      resource: 'Flutter Forms tutorial',
      resourceUrl: 'https://docs.flutter.dev/cookbook/forms/validation',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Navigation between screens',
      task: 'Add multi-screen navigation to your app',
      resource: 'go_router package',
      resourceUrl: 'https://pub.dev/packages/go_router',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'State management basics (Provider/Hooks)',
      task: 'Add state to a counter / todo list',
      resource: 'Flutter – State management guide',
      resourceUrl: 'https://docs.flutter.dev/data-and-backend/state-mgmt/intro',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Lists, ListView & dynamic data',
      task: 'Build a to-do list app (local state)',
      resource: 'Flutter – Lists & grids',
      resourceUrl: 'https://docs.flutter.dev/cookbook/lists',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'Local storage (shared prefs / AsyncStorage)',
      task: 'Persist to-dos across app restarts',
      resource: 'shared_preferences package',
      resourceUrl: 'https://pub.dev/packages/shared_preferences',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Consuming REST APIs in the app',
      task: 'Fetch and display data from a public API',
      resource: 'JSONPlaceholder – free fake API',
      resourceUrl: 'https://jsonplaceholder.typicode.com/',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'Authentication or one core feature',
      task: 'Add login or push notifications',
      resource: 'Firebase Auth – Flutter',
      resourceUrl: 'https://firebase.google.com/docs/auth/flutter/start',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'Debugging, performance & build',
      task: 'Build a release APK / iOS build',
      resource: 'Flutter – Performance best practices',
      resourceUrl: 'https://docs.flutter.dev/perf/best-practices',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'Final demo & app store readiness',
      task: 'Live demo of working app with 1 real feature',
      resource: 'Flutter – Deployment guides',
      resourceUrl: 'https://docs.flutter.dev/deployment/android',
    },
  ],
  'Product/Project Management': [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'What is a PM? Product lifecycle',
      task: 'Map the lifecycle of an app you use daily',
      resource: "Lenny's Newsletter",
      resourceUrl: 'https://www.lennysnewsletter.com/',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'Agile, Scrum & Kanban fundamentals',
      task: 'Create a 2-week sprint board in Trello/Jira',
      resource: 'Atlassian Agile Coach',
      resourceUrl: 'https://www.atlassian.com/agile',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'Identifying user problems & opportunities',
      task: 'Write a clear problem statement for an idea',
      resource: 'SVPG – Articles by Marty Cagan',
      resourceUrl: 'https://www.svpg.com/articles/',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Stakeholder management & prioritization (RICE)',
      task: 'Prioritize 5 features using RICE',
      resource: 'Intercom – RICE prioritization',
      resourceUrl:
        'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Writing user stories & acceptance criteria',
      task: 'Write 5 user stories for a feature',
      resource: 'Atlassian – User stories guide',
      resourceUrl:
        'https://www.atlassian.com/agile/project-management/user-stories',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'Product Requirement Documents (PRDs)',
      task: 'Draft a 1-page PRD for a new WhatsApp feature',
      resource: 'Productboard – PRD templates',
      resourceUrl:
        'https://www.productboard.com/glossary/product-requirements-document-prd/',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Metrics, KPIs & North Star',
      task: 'Define success metrics for your PRD',
      resource: 'Amplitude – North Star framework',
      resourceUrl: 'https://amplitude.com/blog/product-north-star-metric',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'Roadmaps & release planning',
      task: 'Build a 3-month roadmap for your idea',
      resource: 'ProductPlan – Roadmap templates',
      resourceUrl:
        'https://www.productplan.com/learn/product-roadmap-templates/',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Case study: tear-down of an existing app',
      task: 'Choose an app, document its key flows',
      resource: 'Mobbin – App design references',
      resourceUrl: 'https://mobbin.com/',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'User research & feedback synthesis',
      task: 'Run 3 user interviews, summarize insights',
      resource: 'NN/g – User interview guide',
      resourceUrl: 'https://www.nngroup.com/articles/user-interviews/',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'Communicating with engineering & design',
      task: 'Run a mock kickoff meeting with mentor',
      resource: "Lenny's Podcast",
      resourceUrl: 'https://www.lennysnewsletter.com/podcast',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'Final case study presentation',
      task: 'Present case study: problem to solution to metrics',
      resource: 'Reforge – PM resources',
      resourceUrl: 'https://www.reforge.com/blog',
    },
  ],
  'Quality Assurance (QA)': [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'Software testing fundamentals & SDLC',
      task: 'List test types (unit, integration, E2E)',
      resource: 'ISTQB – Foundation syllabus',
      resourceUrl:
        'https://www.istqb.org/certifications/certified-tester-foundation-level',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'Manual testing & test case design',
      task: 'Write 10 test cases for a login page',
      resource: 'Guru99 – Manual testing tutorial',
      resourceUrl: 'https://www.guru99.com/manual-testing.html',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'Black-box techniques (boundary, equivalence)',
      task: 'Apply techniques to a sign-up form',
      resource: 'Software Testing Help – Techniques',
      resourceUrl:
        'https://www.softwaretestinghelp.com/what-is-boundary-value-analysis-and-equivalence-partitioning/',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Cross-browser & mobile testing basics',
      task: 'Test the same site on Chrome, Firefox, mobile',
      resource: 'BrowserStack – Cross-browser testing',
      resourceUrl: 'https://www.browserstack.com/guide/cross-browser-testing',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Test planning & strategy',
      task: 'Write a 1-page test plan for a demo app',
      resource: 'Atlassian – Test plan template',
      resourceUrl: 'https://www.atlassian.com/software-testing/test-plan',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'Bug reporting & severity vs priority',
      task: 'File 5 well-formed bug reports in Jira/Trello',
      resource: 'Atlassian – Bug tracking guide',
      resourceUrl:
        'https://www.atlassian.com/agile/software-development/bug-tracking',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Exploratory & regression testing',
      task: 'Run an exploratory testing session, log findings',
      resource: 'Ministry of Testing – Dojo',
      resourceUrl: 'https://www.ministryoftesting.com/dojo',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'API testing with Postman',
      task: 'Test a public API: write 10 request cases',
      resource: 'Postman – API testing guide',
      resourceUrl: 'https://www.postman.com/api-platform/api-testing/',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Intro to automation: Selenium or Cypress',
      task: 'Automate a basic login flow',
      resource: 'Cypress.io – Documentation',
      resourceUrl: 'https://docs.cypress.io/',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'Writing maintainable automated tests',
      task: 'Add 3 more automated test cases to your suite',
      resource: 'Test Automation University (free)',
      resourceUrl: 'https://testautomationu.applitools.com/',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'CI basics & test reporting',
      task: 'Run your tests in GitHub Actions',
      resource: 'GitHub Actions – Quickstart',
      resourceUrl: 'https://docs.github.com/en/actions/quickstart',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'QA portfolio & final demo',
      task: 'Demo manual + automated tests on demo app',
      resource: 'Ministry of Testing – Career resources',
      resourceUrl: 'https://www.ministryoftesting.com/career',
    },
  ],
  'Data (Analysis/Science)': [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'Data thinking, types & sources',
      task: 'Find 2 open datasets you find interesting',
      resource: 'Kaggle Datasets',
      resourceUrl: 'https://www.kaggle.com/datasets',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'Excel/Sheets: formulas & pivot tables',
      task: 'Build a pivot table summary of a dataset',
      resource: 'Google Sheets – Training & Help',
      resourceUrl: 'https://support.google.com/a/users/answer/9282959',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'SQL basics: SELECT, WHERE, JOIN',
      task: 'Run 10 queries on a sample DB',
      resource: 'Mode – SQL Tutorial',
      resourceUrl: 'https://mode.com/sql-tutorial/',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Aggregations, GROUP BY & subqueries',
      task: 'Answer 5 business questions with SQL',
      resource: 'SQLBolt – Interactive lessons',
      resourceUrl: 'https://sqlbolt.com/',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Intro to Python & Jupyter',
      task: 'Set up Jupyter, load a CSV with Pandas',
      resource: 'Kaggle Learn – Python',
      resourceUrl: 'https://www.kaggle.com/learn/python',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'Pandas: filtering, sorting, transforming',
      task: 'Clean a messy dataset (nulls, types, duplicates)',
      resource: 'Kaggle Learn – Pandas',
      resourceUrl: 'https://www.kaggle.com/learn/pandas',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Data cleaning best practices',
      task: 'Document your cleaning steps in a notebook',
      resource: 'Kaggle Learn – Data Cleaning',
      resourceUrl: 'https://www.kaggle.com/learn/data-cleaning',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'Exploratory Data Analysis (EDA)',
      task: 'Produce a short EDA report on your dataset',
      resource: 'Kaggle Learn – Data Visualization',
      resourceUrl: 'https://www.kaggle.com/learn/data-visualization',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Visualization with Matplotlib/Seaborn',
      task: 'Make 5 clear, labelled charts',
      resource: 'Matplotlib – Gallery',
      resourceUrl: 'https://matplotlib.org/stable/gallery/index.html',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'Dashboards (Looker Studio / Power BI)',
      task: 'Build a 1-page dashboard',
      resource: 'Looker Studio – Help center',
      resourceUrl: 'https://support.google.com/looker-studio/',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'Storytelling with data',
      task: 'Write a 1-page insights brief from your analysis',
      resource: 'Storytelling with Data – Blog',
      resourceUrl: 'https://www.storytellingwithdata.com/blog',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'Final presentation',
      task: 'Present findings + dashboard to mentor panel',
      resource: 'Kaggle Learn – Intermediate ML',
      resourceUrl: 'https://www.kaggle.com/learn/intermediate-machine-learning',
    },
  ],
  Cybersecurity: [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic: 'Cybersecurity landscape & CIA triad',
      task: 'Write a glossary of 20 security terms',
      resource: 'Cybrary – Intro courses',
      resourceUrl: 'https://www.cybrary.it/catalog/',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic: 'Networking basics: TCP/IP, ports, DNS',
      task: 'Diagram how a request reaches a web server',
      resource: 'Professor Messer – Network+ free videos',
      resourceUrl:
        'https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic: 'Common attacks: phishing, SQLi, XSS',
      task: 'Short write-up on 3 attacks + real-world examples',
      resource: 'OWASP Top 10',
      resourceUrl: 'https://owasp.org/www-project-top-ten/',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic: 'Identity & access management',
      task: 'Note on MFA, SSO, and password best practices',
      resource: 'NIST SP 800-63B – Digital Identity',
      resourceUrl: 'https://pages.nist.gov/800-63-3/sp800-63b.html',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic: 'Cryptography essentials (hashing, TLS)',
      task: 'Compare hashing vs encryption with examples',
      resource: 'Crypto101 – Free book',
      resourceUrl: 'https://www.crypto101.io/',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic: 'Secure authentication & session management',
      task: 'Set up MFA on 3 of your accounts; document it',
      resource: 'Auth0 – Authentication best practices',
      resourceUrl: 'https://auth0.com/blog/',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic: 'Secure browsing, VPNs & privacy',
      task: 'Privacy audit on your own browser/devices',
      resource: 'EFF – Surveillance Self-Defense',
      resourceUrl: 'https://ssd.eff.org/',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic: 'Linux & command-line basics for security',
      task: 'Complete 10 OverTheWire Bandit levels',
      resource: 'OverTheWire – Bandit wargame',
      resourceUrl: 'https://overthewire.org/wargames/bandit/',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic: 'Web app security & OWASP Top 10 deep dive',
      task: 'Find 3 issues in a deliberately vulnerable app',
      resource: 'PortSwigger – Web Security Academy',
      resourceUrl: 'https://portswigger.net/web-security',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic: 'Incident response & threat modeling basics',
      task: 'Threat-model a small app (STRIDE)',
      resource: 'Microsoft – Threat Modeling',
      resourceUrl:
        'https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic: 'Real-world breach analysis',
      task: 'Write a case study on a recent breach',
      resource: 'Krebs on Security',
      resourceUrl: 'https://krebsonsecurity.com/',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic: 'Final demo: secure a small app or present case',
      task: 'Present your secured app / breach case study',
      resource: 'Verizon – Data Breach Investigations Report',
      resourceUrl: 'https://www.verizon.com/business/resources/reports/dbir/',
    },
  ],
  Web3: [
    {
      week: 1,
      dates: '25 May – 31 May',
      topic:
        'S1: Blockchain & Ethereum fundamentals (blocks, txs, wallets, Etherscan walk-through)\nS2: Environment setup – Node.js, VS Code, MetaMask, Sepolia testnet, Hardhat init',
      task: 'Find a tx on Etherscan & explain every field; write 200 words on what a smart contract is',
      resource: 'ethereum.org – Introduction to Ethereum',
      resourceUrl: 'https://ethereum.org/en/developers/docs/intro-to-ethereum/',
    },
    {
      week: 2,
      dates: '1 Jun – 7 Jun',
      topic:
        'S1: Solidity types & functions (uint, address, visibility, view/pure); live-code a Counter contract\nS2: First deployment – compile, deploy locally, debug 3 deliberate bugs',
      task: 'Build a TodoList contract (add task, mark complete, count). Post 3 questions in Discord.',
      resource: 'Solidity Docs – Types',
      resourceUrl: 'https://docs.soliditylang.org/en/latest/types.html',
    },
    {
      week: 3,
      dates: '8 Jun – 14 Jun',
      topic:
        'S1: Data structures – mappings, structs, events (indexed); live-code a Transfer event\nS2: Modifiers, require vs revert vs custom errors, first Hardhat tests (describe/it/expect)',
      task: 'Build a Bank contract (deposit/withdraw/balance) using mappings, events, modifiers + full test suite',
      resource: 'Hardhat – Testing contracts guide',
      resourceUrl: 'https://hardhat.org/tutorial/testing-contracts',
    },
    {
      week: 4,
      dates: '15 Jun – 21 Jun',
      topic:
        'S1: Design before code; memory vs storage vs calldata; inheritance & interfaces; build Ownable\nS2: Workshop – students build Week 4 project, mentor answers questions only',
      task: 'Voting Contract project: admin adds candidates, registered voters vote once, time-bound, events, full tests, README',
      resource: 'OpenZeppelin – Access Control',
      resourceUrl: 'https://docs.openzeppelin.com/contracts/access-control',
    },
    {
      week: 5,
      dates: '22 Jun – 28 Jun',
      topic:
        'S1: ERC20 standard – every function, allowance flow; build a minimal ERC20 from scratch\nS2: OpenZeppelin ERC20 – install, inherit, read source; approval race condition fix',
      task: 'Custom ERC20 with max supply cap, owner-only minting, burn function + full test coverage',
      resource: 'EIP-20 – Token Standard',
      resourceUrl: 'https://eips.ethereum.org/EIPS/eip-20',
    },
    {
      week: 6,
      dates: '29 Jun – 5 Jul',
      topic:
        'S1: ERC721 standard – fungible vs non-fungible, safeTransfer, tokenURI, metadata via IPFS\nS2: Build NFT collection with OpenZeppelin ERC721URIStorage; upload to Pinata; mint with IPFS URI',
      task: 'NFT collection: max supply, paid public minting, owner withdrawal, IPFS metadata + tests',
      resource: 'OpenZeppelin – ERC721 Docs',
      resourceUrl: 'https://docs.openzeppelin.com/contracts/erc721',
    },
    {
      week: 7,
      dates: '6 Jul – 12 Jul',
      topic:
        'S1: ERC1155 multi-token standard – when to use each (ERC20 vs 721 vs 1155); live-code multi-token\nS2: DeFi concepts (liquidity, lending, staking, yield); design & start a staking contract',
      task: 'Complete the staking contract (fixed reward rate per block) + tests (stake, advance blocks, withdraw, overdraw)',
      resource: 'OpenZeppelin – ERC1155 Docs',
      resourceUrl: 'https://docs.openzeppelin.com/contracts/erc1155',
    },
    {
      week: 8,
      dates: '13 Jul – 19 Jul',
      topic:
        'S1: Testing methodology – happy path, boundaries, failures, events; time manipulation, snapshots, gas reporter\nS2: Workshop – students build Month 2 project with mentor code review',
      task: 'Token Ecosystem: ERC20 governance token + NFT (mint costs tokens) + staking contract + integration tests + deployment scripts',
      resource: 'Hardhat – Network Helpers & gas reporter',
      resourceUrl: 'https://hardhat.org/hardhat-network/docs/reference',
    },
    {
      week: 9,
      dates: '20 Jul – 26 Jul',
      topic:
        'S1: Reentrancy – walk through vulnerable bank + attacker contract; Checks-Effects-Interactions; ReentrancyGuard\nS2: Integer overflow/underflow & unchecked blocks; tx.origin phishing attack scenario',
      task: 'Audit exercise: provided contract has 3+ vulnerabilities. Find all, write report (vuln/exploit/fix), fix + test.',
      resource: 'Ethernaut – OpenZeppelin CTF',
      resourceUrl: 'https://ethernaut.openzeppelin.com/',
    },
    {
      week: 10,
      dates: '27 Jul – 2 Aug',
      topic:
        'S1: Front-running (mempool, commit-reveal); DoS (push vs pull, unbounded loops); oracle manipulation & TWAPs\nS2: Reading audit reports – Code4rena/Sherlock; read 1 High & 1 Medium finding together',
      task: 'Find a real audit report, read one High severity finding, write a 1-page explanation (vuln/exploit/fix) in your own words',
      resource: 'Code4rena – Public audit reports',
      resourceUrl: 'https://code4rena.com/reports',
    },
    {
      week: 11,
      dates: '3 Aug – 9 Aug',
      topic:
        'S1: Gas optimization – pack structs, cache storage, custom errors, calldata, mark external; measure with gas reporter\nS2: Upgradeability – proxy pattern, EIP-1967 storage slots, timelocks/multisig; read OZ Transparent Proxy',
      task: 'Gas optimization exercise: 10 inefficiencies in a provided contract – fix them all and document savings',
      resource: 'EIP-1967 – Standard Proxy Storage Slots',
      resourceUrl: 'https://eips.ethereum.org/EIPS/eip-1967',
    },
    {
      week: 12,
      dates: '10 Aug – 16 Aug',
      topic:
        'S1: Final workshop – present capstone progress, peer code reviews, mentor feedback on security & tests\nS2: Demo Day – 5 min demo + 5 min Q&A per student (capstone presented at program-wide Graduation event)',
      task: 'Capstone Project: choose ONE – Decentralized Marketplace / Lending Protocol / DAO with Treasury / Yield Aggregator. Full tests, deployment, README.',
      resource: 'Patrick Collins – Free Cyfrin Solidity course',
      resourceUrl: 'https://updraft.cyfrin.io/courses/solidity',
    },
  ],
};

export function getMilestoneForWeek(week: number): 1 | 2 | 3 | null {
  if (week >= 1 && week <= 4) return 1;
  if (week >= 5 && week <= 8) return 2;
  if (week >= 9 && week <= 12) return 3;
  return null;
}
