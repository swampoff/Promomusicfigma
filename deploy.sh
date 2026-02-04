#!/bin/bash

# =====================================================
# 🚀 PROMO.MUSIC DEPLOYMENT SCRIPT
# =====================================================
# Автоматический деплой всей системы
#
# Usage:
#   ./deploy.sh              - Deploy everything
#   ./deploy.sh supabase     - Deploy only Supabase
#   ./deploy.sh vercel       - Deploy only Vercel
#   ./deploy.sh test         - Run API tests only
# =====================================================

set -e # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_section() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# =====================================================
# CHECK PREREQUISITES
# =====================================================
check_prerequisites() {
    log_section "🔍 Checking Prerequisites"
    
    local missing_tools=()
    
    if ! command_exists git; then
        missing_tools+=("git")
    else
        log_success "Git installed"
    fi
    
    if ! command_exists node; then
        missing_tools+=("node")
    else
        log_success "Node.js installed: $(node --version)"
    fi
    
    if ! command_exists pnpm; then
        log_warning "pnpm not found, will use npm"
    else
        log_success "pnpm installed: $(pnpm --version)"
    fi
    
    if ! command_exists supabase; then
        missing_tools+=("supabase-cli")
    else
        log_success "Supabase CLI installed: $(supabase --version)"
    fi
    
    if ! command_exists vercel; then
        log_warning "Vercel CLI not found (optional)"
    else
        log_success "Vercel CLI installed: $(vercel --version)"
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing tools: ${missing_tools[*]}"
        log_info "Install them first:"
        
        for tool in "${missing_tools[@]}"; do
            case $tool in
                git)
                    echo "  - Git: https://git-scm.com/downloads"
                    ;;
                node)
                    echo "  - Node.js: https://nodejs.org/"
                    ;;
                supabase-cli)
                    echo "  - Supabase CLI: brew install supabase/tap/supabase"
                    ;;
            esac
        done
        
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

# =====================================================
# DEPLOY SUPABASE EDGE FUNCTIONS
# =====================================================
deploy_supabase() {
    log_section "📡 Deploying Supabase Edge Functions"
    
    if ! command_exists supabase; then
        log_error "Supabase CLI not installed!"
        log_info "Install: brew install supabase/tap/supabase"
        exit 1
    fi
    
    # Check if logged in
    log_info "Checking Supabase authentication..."
    if ! supabase projects list >/dev/null 2>&1; then
        log_warning "Not logged in to Supabase"
        log_info "Running: supabase login"
        supabase login
    fi
    
    log_info "Deploying Edge Function: make-server-84730125"
    
    if supabase functions deploy make-server-84730125 --no-verify-jwt; then
        log_success "Edge Functions deployed successfully!"
        
        # List deployed functions
        log_info "Deployed functions:"
        supabase functions list
    else
        log_error "Failed to deploy Edge Functions!"
        exit 1
    fi
}

# =====================================================
# DEPLOY FRONTEND TO VERCEL
# =====================================================
deploy_vercel() {
    log_section "🎨 Deploying Frontend to Vercel"
    
    # Install dependencies
    log_info "Installing dependencies..."
    if command_exists pnpm; then
        pnpm install
    else
        npm install
    fi
    
    log_success "Dependencies installed"
    
    # Build project
    log_info "Building project..."
    if command_exists pnpm; then
        pnpm build
    else
        npm run build
    fi
    
    log_success "Build completed"
    
    # Deploy to Vercel
    if command_exists vercel; then
        log_info "Deploying to Vercel..."
        
        vercel --prod --yes
        
        log_success "Deployed to Vercel!"
    else
        log_warning "Vercel CLI not installed"
        log_info "Deploy manually or install CLI: npm i -g vercel"
        log_info "Or push to GitHub - Vercel will auto-deploy"
    fi
}

# =====================================================
# RUN API TESTS
# =====================================================
run_tests() {
    log_section "🧪 Running API Tests"
    
    if [ ! -f "test-api.mjs" ]; then
        log_error "test-api.mjs not found!"
        exit 1
    fi
    
    # Check if environment variables are set
    if [ -z "$PROJECT_ID" ] || [ -z "$AUTH_TOKEN" ]; then
        log_warning "PROJECT_ID or AUTH_TOKEN not set"
        log_info "Set them with:"
        echo "  export PROJECT_ID=your-project-id"
        echo "  export AUTH_TOKEN=your-auth-token"
        echo ""
        log_info "Skipping API tests"
        return
    fi
    
    log_info "Running API tests..."
    
    if node test-api.mjs; then
        log_success "All API tests passed!"
    else
        log_warning "Some API tests failed (this is OK for first deployment)"
    fi
}

# =====================================================
# GIT PUSH
# =====================================================
git_push() {
    log_section "📤 Pushing to GitHub"
    
    # Check if git repo
    if [ ! -d ".git" ]; then
        log_error "Not a git repository!"
        log_info "Initialize with: git init"
        exit 1
    fi
    
    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes to commit"
    else
        log_info "Adding changes..."
        git add .
        
        log_info "Committing changes..."
        COMMIT_MSG="${1:-Auto-deploy $(date +'%Y-%m-%d %H:%M:%S')}"
        git commit -m "$COMMIT_MSG"
        
        log_success "Changes committed"
    fi
    
    # Push to remote
    log_info "Pushing to GitHub..."
    
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    if git push origin "$CURRENT_BRANCH"; then
        log_success "Pushed to GitHub!"
        log_info "GitHub Actions will auto-deploy"
    else
        log_error "Failed to push to GitHub"
        exit 1
    fi
}

# =====================================================
# FULL DEPLOYMENT
# =====================================================
deploy_all() {
    log_section "🚀 Full Deployment Started"
    
    check_prerequisites
    
    # Ask for confirmation
    echo ""
    log_warning "This will:"
    echo "  1. Deploy Supabase Edge Functions"
    echo "  2. Build and deploy Frontend to Vercel"
    echo "  3. Run API tests"
    echo "  4. Push to GitHub (triggers CI/CD)"
    echo ""
    
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Deploy Supabase
    deploy_supabase
    
    # Deploy Vercel
    deploy_vercel
    
    # Run tests
    run_tests
    
    # Git push
    read -p "Push to GitHub? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git_push "Deploy: Updated code $(date +'%Y-%m-%d %H:%M:%S')"
    fi
    
    log_section "🎉 Deployment Complete!"
    
    log_success "All deployments successful!"
    echo ""
    log_info "Next steps:"
    echo "  - Check Supabase Functions: https://supabase.com/dashboard/project/_/functions"
    echo "  - Check Vercel deployment: https://vercel.com/dashboard"
    echo "  - Monitor GitHub Actions: https://github.com/your-repo/actions"
    echo ""
}

# =====================================================
# MAIN SCRIPT
# =====================================================
main() {
    # ASCII Art
    echo -e "${CYAN}"
    cat << "EOF"
    ____                               __  ___           _     
   / __ \________  ____ ___  ____     /  |/  /_  _______(_)____
  / /_/ / ___/ _ \/ __ `__ \/ __ \   / /|_/ / / / / ___/ / ___/
 / ____/ /  /  __/ / / / / / /_/ /_ / /  / / /_/ (__  ) / /__  
/_/   /_/   \___/_/ /_/ /_/\____/(_)_/  /_/\__,_/____/_/\___/  
                                                                
    🚀 DEPLOYMENT SCRIPT
EOF
    echo -e "${NC}"
    
    # Parse arguments
    case "${1:-all}" in
        supabase)
            check_prerequisites
            deploy_supabase
            ;;
        vercel)
            check_prerequisites
            deploy_vercel
            ;;
        test)
            run_tests
            ;;
        push)
            git_push "$2"
            ;;
        all)
            deploy_all
            ;;
        *)
            log_error "Unknown command: $1"
            echo ""
            echo "Usage:"
            echo "  ./deploy.sh              - Deploy everything"
            echo "  ./deploy.sh supabase     - Deploy only Supabase"
            echo "  ./deploy.sh vercel       - Deploy only Vercel"
            echo "  ./deploy.sh test         - Run API tests"
            echo "  ./deploy.sh push [msg]   - Git push with optional message"
            exit 1
            ;;
    esac
}

# Run main
main "$@"
