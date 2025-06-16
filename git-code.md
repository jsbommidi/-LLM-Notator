# Git Commands Reference - LLM Notator

This document contains all the Git commands used for the LLM Notator project and serves as a reference for future development.

## Initial Repository Setup

### 1. Initialize Local Repository
```bash
git init
```

### 2. Add All Files to Staging
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "Initial commit: Complete LLM Notator boilerplate - Add Gin (Go) backend with REST API endpoints - Add Next.js frontend with TypeScript and annotation interface - Include Docker containerization with docker-compose - Add sample data and comprehensive documentation - Include Makefile for development commands"
```

### 4. Rename Branch to Main
```bash
git branch -M main
```

### 5. Add Remote Origin
```bash
git remote add origin https://github.com/jsbommidi/-LLM-Notator.git
```

### 6. Push to Remote Repository
```bash
git push -u origin main
```

## Daily Development Workflow

### Check Repository Status
```bash
git status
```

### View Changes
```bash
# View unstaged changes
git diff

# View staged changes
git diff --cached

# View changes between commits
git diff HEAD~1 HEAD
```

### Stage and Commit Changes
```bash
# Stage specific files
git add <filename>

# Stage all changes
git add .

# Stage all modified files (not new files)
git add -u

# Commit with message
git commit -m "Your commit message here"

# Commit and stage all tracked files
git commit -am "Your commit message here"
```

### Working with Branches
```bash
# List all branches
git branch

# Create new branch
git branch <branch-name>

# Switch to branch
git checkout <branch-name>

# Create and switch to new branch
git checkout -b <branch-name>

# Delete branch (locally)
git branch -d <branch-name>

# Delete branch (force)
git branch -D <branch-name>
```

### Syncing with Remote
```bash
# Fetch latest changes
git fetch origin

# Pull latest changes
git pull origin main

# Push changes to remote
git push origin main

# Push new branch to remote
git push -u origin <branch-name>
```

### Viewing History
```bash
# View commit history
git log

# View compact history
git log --oneline

# View graphical history
git log --graph --oneline --all

# View specific file history
git log --follow <filename>
```

### Undoing Changes
```bash
# Discard unstaged changes in working directory
git checkout -- <filename>

# Discard all unstaged changes
git checkout -- .

# Unstage a file (keep changes in working directory)
git reset HEAD <filename>

# Reset to last commit (lose all changes)
git reset --hard HEAD

# Reset to specific commit
git reset --hard <commit-hash>

# Revert a commit (creates new commit)
git revert <commit-hash>
```

### Stashing Changes
```bash
# Stash current changes
git stash

# Stash with message
git stash save "Work in progress on feature X"

# List stashes
git stash list

# Apply latest stash
git stash apply

# Apply specific stash
git stash apply stash@{0}

# Pop latest stash (apply and remove)
git stash pop

# Drop a stash
git stash drop stash@{0}
```

## Collaboration Commands

### Forking and Pull Requests
```bash
# Clone forked repository
git clone https://github.com/YOUR-USERNAME/-LLM-Notator.git

# Add upstream remote (original repository)
git remote add upstream https://github.com/jsbommidi/-LLM-Notator.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main

# Push updated main to your fork
git push origin main
```

### Merging and Rebasing
```bash
# Merge branch into current branch
git merge <branch-name>

# Rebase current branch onto main
git rebase main

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Continue rebase after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

## Tag Management
```bash
# Create lightweight tag
git tag v1.0.0

# Create annotated tag
git tag -a v1.0.0 -m "Version 1.0.0 release"

# List tags
git tag

# Push tags to remote
git push origin --tags

# Delete tag locally
git tag -d v1.0.0

# Delete tag on remote
git push origin :refs/tags/v1.0.0
```

## Configuration Commands
```bash
# Set user name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default editor
git config --global core.editor "code --wait"

# Set default branch name
git config --global init.defaultBranch main

# View configuration
git config --list

# View specific configuration
git config user.name
```

## Useful Aliases
Add these to your Git configuration for faster commands:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
git config --global alias.graph 'log --graph --oneline --all'
```

## Best Practices

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(backend): add annotation export endpoint"
git commit -m "fix(frontend): resolve navigation button styling issue"
git commit -m "docs: update API documentation"
git commit -m "chore(docker): update Node.js version to 18.19"
```

### Branch Naming Conventions
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Pre-commit Checklist
Before committing changes:
1. Run tests: `make test`
2. Check code formatting: `make format`
3. Verify Docker build: `make build`
4. Review changes: `git diff --cached`
5. Write clear commit message

## Emergency Commands

### Recover Lost Work
```bash
# Find lost commits
git reflog

# Recover specific commit
git checkout <commit-hash>

# Create branch from recovered commit
git checkout -b recovery-branch <commit-hash>
```

### Resolve Merge Conflicts
```bash
# During merge conflict
# 1. Edit conflicted files manually
# 2. Stage resolved files
git add <resolved-file>

# 3. Complete merge
git commit

# Or use merge tool
git mergetool
```

### Clean Repository
```bash
# Remove untracked files (dry run)
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd

# Remove ignored files too
git clean -fdx
```

## Repository Information
- **Repository URL**: https://github.com/jsbommidi/-LLM-Notator.git
- **Default Branch**: main
- **License**: MIT (add LICENSE file if needed)
- **Contributors**: Add CONTRIBUTING.md for contribution guidelines

---

**Note**: Always test your changes locally before pushing to the remote repository. Use `make up` to test the full application stack. 