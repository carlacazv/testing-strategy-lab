export const mutants = [
  {
    id: 'unit-date-year-format',
    path: 'frontend/src/helpers/dateFormatter.js',
    from: 'year: "numeric"',
    to: 'year: "2-digit"',
    risk: 'Incorrect user-visible date formatting',
  },
  {
    id: 'component-empty-tags-render-list',
    path: 'frontend/src/components/ArticleTags/ArticleTags.jsx',
    from: 'tagList?.length > 0',
    to: 'tagList?.length >= 0',
    risk: 'Empty tag collections render meaningless UI',
  },
  {
    id: 'e2e-home-tagline-regression',
    path: 'frontend/src/routes/Home.jsx',
    from: 'A place to share your knowledge.',
    to: 'A place to hide your knowledge.',
    risk: 'User-visible home content regression',
  },
  {
    id: 'e2e-login-wrong-navigation',
    path: 'frontend/src/components/LoginForm/LoginForm.jsx',
    from: 'navigate("/")',
    to: 'navigate("/settings")',
    risk: 'Successful login sends the user to the wrong destination',
  },
];
