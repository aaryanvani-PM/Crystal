import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Persistence storage directory
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SHARES_FILE = path.join(DATA_DIR, 'shares.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ---------------- Gemini Minimalist Infographic Schema ----------------
const infographicResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Clean headline title for the infographic card (e.g. "Cardio Timing & Substrate Utilization").'
    },
    subtitle: {
      type: Type.STRING,
      description: 'Muted descriptive subtitle explaining the relationship or timeframe (e.g. "Energy source ratio (% Fat vs % Glycogen) over a 75-minute exercise timeline").'
    },
    cardType: {
      type: Type.STRING,
      enum: ['scenario-area', 'dynamic-slider-schedule', 'stepper-pipeline'],
      description: 'The interactive mechanism best suited for this prompt.'
    },

    // 1. For scenario-area
    switcherConfig: {
      type: Type.OBJECT,
      description: 'Configuration for scenario switches (e.g., Post-Workout vs Pre-Workout, Plan A vs Plan B).',
      properties: {
        switchLabel: { type: Type.STRING, description: 'e.g. "Workout Sequence:" or "Strategy Model:"' },
        activeScenarioId: { type: Type.STRING, description: 'e.g. "scenario-a"' },
        scenarios: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING, description: 'e.g. "Elliptical After Lift (Post-Workout)"' },
              metrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING, description: 'e.g. "Cardio Fat Burn Ratio"' },
                    value: { type: Type.STRING, description: 'e.g. "95%"' },
                    note: { type: Type.STRING, description: 'e.g. "Pure fat oxidation during cardio"' }
                  },
                  required: ['id', 'label', 'value']
                }
              },
              chartData: {
                type: Type.OBJECT,
                properties: {
                  labels: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Time or category labels, e.g. ["0m", "15m", "30m", "45m", "60m", "75m"]'
                  },
                  series: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: 'e.g. "Glycogen Burn (%)"' },
                        color: { type: Type.STRING, description: 'e.g. "#60a5fa" or "#eab308"' },
                        data: {
                          type: Type.ARRAY,
                          items: { type: Type.NUMBER },
                          description: 'Values between 0 and 100'
                        }
                      },
                      required: ['name', 'color', 'data']
                    }
                  }
                },
                required: ['labels', 'series']
              },
              insightHighlight: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'e.g. "Metabolic Superiority:"' },
                  text: { type: Type.STRING, description: 'Detailed biological or analytical reasoning.' }
                },
                required: ['title', 'text']
              }
            },
            required: ['id', 'label', 'metrics', 'chartData']
          }
        }
      }
    },

    // 2. For dynamic-slider-schedule
    sliderConfig: {
      type: Type.OBJECT,
      description: 'Configuration for dynamic parameter slider (e.g. Days per week, Team size, Budget).',
      properties: {
        label: { type: Type.STRING, description: 'e.g. "Zone 2 Cardio Days / Week"' },
        min: { type: Type.NUMBER },
        max: { type: Type.NUMBER },
        step: { type: Type.NUMBER },
        defaultValue: { type: Type.NUMBER },
        unit: { type: Type.STRING, description: 'e.g. "Days"' },
        labels: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]'
        },
        liftingBase: {
          type: Type.ARRAY,
          items: { type: Type.NUMBER },
          description: 'Baseline numbers for the primary series across labels'
        }
      }
    },

    // 3. For stepper-pipeline
    pipelineConfig: {
      type: Type.OBJECT,
      description: 'Configuration for pipeline flowchart and step walkthroughs.',
      properties: {
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.NUMBER },
              stepTitle: { type: Type.STRING, description: 'e.g. "Step 1: Unstructured User Prompt"' },
              tag: { type: Type.STRING, description: 'e.g. "USER INPUT"' },
              description: { type: Type.STRING, description: 'Step explanation' }
            },
            required: ['stepNumber', 'stepTitle', 'tag', 'description']
          }
        }
      }
    }
  },
  required: ['title', 'subtitle', 'cardType']
};

// ---------------- API Routes ----------------

app.post('/api/infographic/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, currentData, editInstruction } = req.body;

    if (!prompt && !editInstruction) {
      res.status(400).json({ error: 'Prompt or edit instruction is required' });
      return;
    }

    let userInstruction = '';
    if (editInstruction && currentData) {
      userInstruction = `Update this existing minimalist infographic based on the user's refinement:
Current:
${JSON.stringify(currentData, null, 2)}

Refinement Request:
"${editInstruction}"

Maintain minimalist styling, clean data, and accurate numeric series.`;
    } else {
      userInstruction = `You are Gemini's minimalist Information Architect and Infographic Designer.
User Prompt:
"${prompt}"

Create an authentic, minimalist Gemini interactive infographic card matching these design principles:
1. Card Style: Deep matte dark background (#161619), clean typography, zero visual clutter, no decorative neon gradients. Contrasting colors are reserved STRICTLY inside the chart/graph for bifurcations (e.g. soft blue #60a5fa, warm yellow/olive #eab308, vibrant pink #f472b6, soft cyan #7dd3fc).
2. Choose the ideal cardType:
   - 'scenario-area': If comparing two conditions, sequences, or options (e.g., Post-Workout vs Pre-Workout, A vs B, With vs Without). Include 2 scenarios in switcherConfig with 3 clean KPI metric cards and area curves.
   - 'dynamic-slider-schedule': If there is an adjustable frequency, slider parameter, or weekly split (e.g. days per week, budget, intensity). Include sliderConfig with labels Mon-Sun and base numbers.
   - 'stepper-pipeline': If explaining an architecture, process, workflow, or algorithm. Include 4 to 5 sequential steps in pipelineConfig.
3. Keep labels short, numbers crisp and realistic, and insights insightful.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userInstruction,
      config: {
        systemInstruction:
          'You are an elite data visualization scientist and visual information designer. Output valid structured JSON matching the schema. Adhere strictly to minimalist aesthetics.',
        responseMimeType: 'application/json',
        responseSchema: infographicResponseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);

    // Normalize generated card
    const resultInfographic = {
      id: currentData?.id || `infographic-${Date.now()}`,
      title: parsed.title || 'Interactive Data Infographic',
      subtitle: parsed.subtitle || '',
      cardType: parsed.cardType || 'scenario-area',
      switcherConfig: parsed.switcherConfig,
      sliderConfig: parsed.sliderConfig,
      pipelineConfig: parsed.pipelineConfig,
      originalPrompt: prompt || currentData?.originalPrompt || '',
      createdAt: currentData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    res.json(resultInfographic);
  } catch (err: any) {
    console.error('Error in /api/infographic/generate:', err);
    res.status(500).json({
      error: 'Failed to generate infographic',
      details: err?.message || String(err),
    });
  }
});

// Projects CRUD
app.get('/api/projects', (req: Request, res: Response): void => {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  res.json(projects);
});

app.post('/api/projects', (req: Request, res: Response): void => {
  const { project } = req.body;
  if (!project || !project.id) {
    res.status(400).json({ error: 'Valid project object with id is required' });
    return;
  }

  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const existingIdx = projects.findIndex((p) => p.id === project.id);
  const updatedProject = {
    ...project,
    updatedAt: Date.now(),
  };

  if (existingIdx >= 0) {
    projects[existingIdx] = updatedProject;
  } else {
    projects.unshift(updatedProject);
  }

  writeJsonFile(PROJECTS_FILE, projects);
  res.json({ success: true, project: updatedProject });
});

app.delete('/api/projects/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const filtered = projects.filter((p) => p.id !== id);
  writeJsonFile(PROJECTS_FILE, filtered);
  res.json({ success: true, count: filtered.length });
});

// Share links API
app.post('/api/share', (req: Request, res: Response): void => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: 'Infographic data required to share' });
    return;
  }

  const shares = readJsonFile<Record<string, any>>(SHARES_FILE, {});
  const shareId = `share_${Math.random().toString(36).substring(2, 9)}`;
  shares[shareId] = {
    id: shareId,
    createdAt: Date.now(),
    data,
  };

  writeJsonFile(SHARES_FILE, shares);
  res.json({ success: true, shareId });
});

app.get('/api/share/:shareId', (req: Request, res: Response): void => {
  const { shareId } = req.params;
  const shares = readJsonFile<Record<string, any>>(SHARES_FILE, {});
  const shared = shares[shareId];
  if (!shared) {
    res.status(404).json({ error: 'Shared infographic not found' });
    return;
  }
  res.json(shared.data);
});

// ---------------- Vite Dev vs Prod Integration ----------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InfographAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
