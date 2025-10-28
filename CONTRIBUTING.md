# ArtiPanel Contributing Guide

## Welcome Contributors!

ArtiPanel is an open-source project, and we welcome contributions from the community. Whether it's bug fixes, features, documentation, or anything else - your help is appreciated!

## Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/ArtiPanel.git
cd ArtiPanel
```

### 2. Set Up Development Environment

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## Code Standards

### TypeScript
- Strict mode enabled
- All functions must have type annotations
- Prefer interfaces over types
- Use descriptive variable names

### Git Commits
```
feat: add gaming server management
fix: resolve database connection issue
docs: update installation guide
test: add server service tests
refactor: improve error handling
chore: update dependencies
```

### PR Guidelines
1. One feature per PR
2. Include tests
3. Update documentation
4. Add changelog entry
5. Request review from maintainers

## Project Structure

```
ArtiPanel/
├── backend/          # Node.js API
├── frontend/         # React UI
├── docs/            # Documentation
├── scripts/         # Setup & deployment
└── tests/           # Integration tests
```

## Development Workflow

### Backend Development
```bash
# 1. Install dependencies
cd backend && npm install

# 2. Start dev server
npm run dev

# 3. Run tests
npm test

# 4. Build for production
npm run build
```

### Frontend Development
```bash
# 1. Install dependencies
cd frontend && npm install

# 2. Start dev server
npm run dev

# 3. Build for production
npm run build
```

## Testing

### Run Tests
```bash
npm test              # Run all tests
npm test --watch     # Watch mode
npm test -- --coverage  # Coverage report
```

### Write Tests
- Place tests in `*.test.ts` or `*.spec.ts`
- Use Jest/Vitest
- Aim for >80% coverage

## Documentation

- Update docs/ for feature documentation
- Add API docs for new endpoints
- Include usage examples
- Keep README.md current

## Areas to Contribute

### High Priority
- [ ] Complete Minecraft server manager
- [ ] NAS/RAID management module
- [ ] Advanced monitoring dashboard
- [ ] Kubernetes integration improvements
- [ ] Mobile-friendly improvements

### Good For Beginners
- [ ] Bug fixes (labeled: good-first-issue)
- [ ] Documentation improvements
- [ ] UI/UX enhancements
- [ ] Test coverage expansion
- [ ] Translation updates

### Advanced
- [ ] Performance optimization
- [ ] Architecture improvements
- [ ] Security enhancements
- [ ] New integrations
- [ ] Machine learning features

## Reporting Issues

### Bug Reports
Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment details

### Feature Requests
Include:
- Description of feature
- Use case
- Why it's needed
- Proposed implementation (optional)

## Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass
   - Build succeeds

2. **Code Review**
   - Maintainer review
   - Feedback incorporation
   - Approval

3. **Merge**
   - Squash commit
   - Update CHANGELOG.md
   - Close related issues

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```
feat(gaming): add Minecraft Bedrock support

Implement Minecraft Bedrock edition server management with:
- Server installation
- Player management
- Backup system

Closes #123
```

## Code Review Checklist

- [ ] Code follows style guide
- [ ] Comments added for complex logic
- [ ] Tests included
- [ ] Documentation updated
- [ ] No console.log() left in code
- [ ] Error handling implemented
- [ ] Performance considered
- [ ] Security reviewed

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Build Docker images
5. Push to Docker Hub
6. Create GitHub release
7. Announce in Discord

## Questions?

- 📖 Check [Docs](./docs/)
- 💬 Open GitHub Discussion
- 💬 Join [Discord](https://discord.gg/artipanel)
- 📧 Email: contribute@artipanel.dev

## Code of Conduct

- Be respectful
- Be inclusive
- Be professional
- Report issues to maintainers

---

**Thank you for contributing to ArtiPanel! 🚀**
