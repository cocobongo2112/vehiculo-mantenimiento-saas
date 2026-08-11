module.exports = {
  ci: {
    collect: {
      url: [
        process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:3000/',
        `${process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:3000'}/busqueda`,
        `${process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:3000'}/auth/login`
      ],
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:seo': ['warn', { minScore: 0.80 }]
      }
    },
    upload: { target: 'filesystem', outputDir: 'qa-reports/lighthouse' }
  }
};
