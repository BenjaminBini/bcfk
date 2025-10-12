# System Commands for BCFK Development (macOS Darwin)

## Standard Unix Commands
These work as expected on macOS Darwin:

### File Operations
```bash
ls                 # List directory contents
cd                 # Change directory
mkdir              # Create directories
rm                 # Remove files/directories
cp                 # Copy files
mv                 # Move/rename files
find               # Search for files and directories
grep               # Search text patterns in files
```

### Process Management
```bash
ps aux             # List running processes
kill -9 <pid>      # Force kill process
lsof -ti:3001      # Find processes using port 3001 (used in cleanup script)
```

### Version Control
```bash
git status         # Check git repository status
git add            # Stage changes
git commit         # Commit changes
git push           # Push to remote
git pull           # Pull from remote
git diff           # Show changes
```

### Development Tools
```bash
node               # Run Node.js scripts
npm                # Node package manager
npx                # Execute npm packages
```

## BCFK-Specific Command Patterns

### Process Management
```bash
# Kill development servers (from package.json cleanup script)
lsof -ti:3001 | xargs kill -9 || true

# Find what's running on development ports
lsof -i :3001      # Backend port
lsof -i :5173      # Frontend port
```

### Docker Operations
```bash
docker-compose up -d        # Start containers in background
docker-compose down         # Stop containers
docker-compose logs         # View container logs
docker ps                   # List running containers
```

### File Watching and Monitoring
```bash
# Development with file watching (handled by nodemon and Vite)
npm run dev                 # Both servers with auto-reload

# Tail log files if they exist
tail -f server.log         # Backend logs
tail -f logs/*             # Application logs
```

## macOS-Specific Considerations

### Case Sensitivity
- macOS filesystem is case-insensitive by default
- Be careful with file naming consistency
- Git may not detect case-only changes

### Permissions
- Use `chmod +x` to make scripts executable
- Docker may require elevated permissions for volume mounts

### System Integration
- Spotlight indexing may affect performance
- `.DS_Store` files are ignored in .gitignore
- Terminal.app or iTerm2 for command line work

## Useful Development Aliases
Consider adding these to ~/.zshrc or ~/.bash_profile:

```bash
alias ll='ls -la'
alias ..='cd ..'
alias gs='git status'
alias gd='git diff'
alias bcfk-dev='cd /path/to/bcfk && npm run dev'
alias bcfk-test='cd /path/to/bcfk && npm test'
```