#!/bin/bash

echo "🚀 OnWay Deployment Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository. Please initialize git first."
    exit 1
fi

echo "📋 Pre-deployment Checklist"
echo "----------------------------"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        print_success "Changes committed"
    else
        print_warning "Proceeding without committing changes"
    fi
else
    print_success "No uncommitted changes"
fi

echo ""
echo "🔍 Checking Backend Files"
echo "-------------------------"

# Check if backend files exist
if [ -f "backend/server.js" ]; then
    print_success "backend/server.js found"
else
    print_error "backend/server.js not found"
    exit 1
fi

if [ -f "backend/vercel.json" ]; then
    print_success "backend/vercel.json found"
else
    print_error "backend/vercel.json not found"
    exit 1
fi

if [ -f "backend/package.json" ]; then
    print_success "backend/package.json found"
else
    print_error "backend/package.json not found"
    exit 1
fi

echo ""
echo "🔍 Checking Frontend Files"
echo "---------------------------"

if [ -f "on-way/package.json" ]; then
    print_success "on-way/package.json found"
else
    print_error "on-way/package.json not found"
    exit 1
fi

if [ -f "on-way/.env.local" ]; then
    print_success "on-way/.env.local found"
else
    print_warning "on-way/.env.local not found (optional)"
fi

echo ""
echo "📤 Pushing to GitHub"
echo "--------------------"

# Get current branch
current_branch=$(git branch --show-current)
print_success "Current branch: $current_branch"

# Push to GitHub
if git push origin $current_branch; then
    print_success "Code pushed to GitHub successfully"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "Next Steps:"
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Check deployment status for both projects"
echo "3. View function logs if there are any errors"
echo "4. Test the API endpoints:"
echo "   - Health: https://on-way-server.vercel.app/api/health"
echo "   - Test: https://on-way-server.vercel.app/api/test"
echo ""
echo "5. Test registration from your frontend"
echo ""
print_success "Deployment script completed!"
