#!/bin/bash
set -e

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

# Files to store errors and fixes
ERROR_LOG="build-errors.log"
FIXES_LOG="claude-fixes.md"
ERROR_COUNT_FILE=".error_count"

# Initialize or read error counter
if [ -f "$ERROR_COUNT_FILE" ]; then
    ERROR_COUNT=$(cat "$ERROR_COUNT_FILE")
else
    ERROR_COUNT=0
fi

# Functions
run_build() {
    echo -e "${BLUE}Running Next.js build...${NC}"
    if npm run build > build-output.log 2>$ERROR_LOG; then
        echo -e "${GREEN}Build succeeded!${NC}"
        return 0
    else
        echo -e "${RED}Build failed. See errors in $ERROR_LOG${NC}"
        # Filter out warnings and keep only errors
        grep -E "Error:|error:" $ERROR_LOG > error-only.log || true
        mv error-only.log $ERROR_LOG
        return 1
    fi
}

run_lint() {
    echo -e "${BLUE}Running linter...${NC}"
    if npm run lint -- --quiet > lint-output.log 2>>$ERROR_LOG || true; then
        echo -e "${GREEN}Linting passed!${NC}"
        return 0
    else
        echo -e "${RED}Linting failed. See errors in $ERROR_LOG${NC}"
        return 1
    fi
}

run_type_check() {
    echo -e "${BLUE}Running TypeScript type check...${NC}"
    if npm run typecheck > type-output.log 2>>$ERROR_LOG; then
        echo -e "${GREEN}Type checking passed!${NC}"
        return 0
    else
        echo -e "${RED}Type checking failed. See errors in $ERROR_LOG${NC}"
        return 1
    fi
}

analyze_errors() {
    ERROR_COUNT=$((ERROR_COUNT + 1))
    echo $ERROR_COUNT > "$ERROR_COUNT_FILE"
    
    echo -e "${YELLOW}Analyzing errors...${NC}"
    
    # Create a file with the error information
    cat > $FIXES_LOG << EOL
# Build/Lint/TypeScript Errors

## Error Details

The following errors were found in your Next.js project:

\`\`\`
$(cat $ERROR_LOG)
\`\`\`

## Suggested Steps

1. Review the errors above
2. Check each file mentioned in the errors
3. Apply fixes to address the problems
4. Run the check again to verify the fixes

## Common Solutions

- Missing dependencies: Run \`npm install\` to install missing packages
- TypeScript errors: Check type definitions and fix inconsistencies
- Linting issues: Fix code style as recommended by ESLint
- Build errors: Address any syntax or import errors in your components
EOL

    echo -e "${GREEN}Error analysis complete!${NC}"
    echo -e "${GREEN}Check $FIXES_LOG for error details and next steps.${NC}"
    
    # Display the errors in the terminal as well
    echo -e "${YELLOW}Error details:${NC}"
    cat $ERROR_LOG
}

# Main loop
while true; do
    echo -e "\n${BLUE}=== Iteration $ERROR_COUNT: Starting error detection ====${NC}\n"
    
    # Run checks - add or remove as needed for your project
    BUILD_SUCCESS=0
    LINT_SUCCESS=0
    TYPE_SUCCESS=0
    
    # Clear previous error log
    > $ERROR_LOG
    
    # Run type checking
    echo -e "${BLUE}Running TypeScript type check...${NC}"
    npm run typecheck > type-output.log 2>>$ERROR_LOG
    TYPE_SUCCESS=$?
    
    if [ $TYPE_SUCCESS -eq 0 ]; then
        echo -e "${GREEN}Type checking passed!${NC}"
    else
        echo -e "${RED}Type checking failed. See errors in $ERROR_LOG${NC}"
    fi
    
    # Run linting
    echo -e "${BLUE}Running linter...${NC}"
    npm run lint > lint-output.log 2>>$ERROR_LOG
    LINT_SUCCESS=$?
    
    if [ $LINT_SUCCESS -eq 0 ]; then
        echo -e "${GREEN}Linting passed!${NC}"
    else
        echo -e "${RED}Linting failed. See errors in $ERROR_LOG${NC}"
    fi
    
    # Run build
    echo -e "${BLUE}Running Next.js build...${NC}"
    npm run build > build-output.log 2>>$ERROR_LOG
    BUILD_SUCCESS=$?
    
    if [ $BUILD_SUCCESS -eq 0 ]; then
        echo -e "${GREEN}Build succeeded!${NC}"
    else
        echo -e "${RED}Build failed. See errors in $ERROR_LOG${NC}"
        # Filter out warnings and keep only errors
        grep -E "Error:|error:" $ERROR_LOG > error-only.log 2>/dev/null || true
        if [ -s error-only.log ]; then
            mv error-only.log $ERROR_LOG
        fi
    fi
    
    # Check if all passed
    if [ $BUILD_SUCCESS -eq 0 ] && [ $LINT_SUCCESS -eq 0 ] && [ $TYPE_SUCCESS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All checks passed! Your code is error-free.${NC}"
        # Clean up temporary files
        rm -f $ERROR_COUNT_FILE prompt.txt
        break
    fi
    
    # Analyze errors
    analyze_errors
    
    # Ask user to apply fixes
    echo -e "\n${YELLOW}Review Claude's suggestions in $FIXES_LOG${NC}"
    echo -e "${YELLOW}After applying fixes, press Enter to run checks again, or type 'quit' to exit:${NC}"
    read -r USER_INPUT
    
    if [ "$USER_INPUT" = "quit" ]; then
        echo -e "${BLUE}Exiting error correction workflow.${NC}"
        break
    fi
done

echo -e "\n${GREEN}Error correction workflow complete!${NC}"