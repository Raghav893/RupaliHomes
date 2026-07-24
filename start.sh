#!/bin/bash

# Rupali Homes - Start Frontend & Backend together

echo "🏠 Starting Rupali Homes..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Kill any existing processes on ports 3000 and 8080
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start backend
echo -e "${CYAN}Starting Backend (Spring Boot) on port 8080...${NC}"
cd "$SCRIPT_DIR/backend_new"
chmod +x mvnw
./mvnw spring-boot:run > /tmp/rupali_backend.log 2>&1 &
BACKEND_PID=$!
echo -e "  Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is ready!${NC}"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo -e "${YELLOW}⚠ Backend may still be starting...${NC}"
  fi
done

# Start frontend
echo -e "${CYAN}Starting Frontend (Next.js) on port 3000...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > /tmp/rupali_frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "  Frontend PID: $FRONTEND_PID"

sleep 3

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🏠 Rupali Homes is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "  Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend:   ${CYAN}http://localhost:8080${NC}"
echo -e "  Admin:     ${CYAN}http://localhost:3000/admin${NC}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo -e '${YELLOW}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e '${GREEN}✓ Stopped!${NC}'; exit 0" INT TERM

# Keep script running
wait
