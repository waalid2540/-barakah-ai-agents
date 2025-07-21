const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const middlewareDir = path.join(__dirname, 'src/middleware');

// Fix route files
const routeFiles = ['agents.ts', 'analytics.ts', 'auth.ts', 'integrations.ts', 'workflows.ts', 'admin.ts'];

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Request and Response imports if not present
    if (content.includes("import express from 'express';") && !content.includes('Request, Response')) {
      content = content.replace("import express from 'express';", "import express, { Request, Response } from 'express';");
    }
    
    // Fix all route handlers
    content = content.replace(/async \(req, res\) =>/g, 'async (req: Request, res: Response) =>');
    content = content.replace(/async \(req: AuthenticatedRequest, res\) =>/g, 'async (req: AuthenticatedRequest, res: Response) =>');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});

// Fix middleware files
const middlewareFiles = ['errorHandler.ts'];

middlewareFiles.forEach(file => {
  const filePath = path.join(middlewareDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Request and Response imports if not present
    if (content.includes("import express from 'express';") && !content.includes('Request, Response')) {
      content = content.replace("import express from 'express';", "import express, { Request, Response } from 'express';");
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});

console.log('All type fixes applied!');