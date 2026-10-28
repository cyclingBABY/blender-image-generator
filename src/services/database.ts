import { Project, GenerationJob, ModelVersion } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'image3d_projects_v1',
  CURRENT_PROJECT_ID: 'image3d_current_project_v1',
  SETTINGS: 'image3d_settings_v1',
  JOBS: 'image3d_jobs_v1',
};

export interface AppSettings {
  defaultProvider: string;
  defaultQuality: 'draft' | 'standard' | 'high';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  selfHostedWorkerUrl: string;
  apiKeys: {
    gemini?: string;
    replicate?: string;
    fal?: string;
    meshy?: string;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultProvider: 'local_procedural',
  defaultQuality: 'standard',
  selfHostedWorkerUrl: 'http://localhost:8000',
  apiKeys: {},
};

/**
 * Loads all projects from storage
 */
export function getSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading projects from storage', e);
    return [];
  }
}

/**
 * Saves or updates a project in storage
 */
export function saveProject(project: Project): void {
  try {
    const projects = getSavedProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving project', e);
  }
}

/**
 * Deletes a project
 */
export function deleteProject(projectId: string): void {
  try {
    const projects = getSavedProjects().filter((p) => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error deleting project', e);
  }
}

/**
 * Loads user settings
 */
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves user settings
 */
export function saveAppSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

/**
 * Generates the full PostgreSQL / Supabase SQL migration script
 * for profiles, projects, generation_jobs, assets, model_versions, and provider_settings
 * as specified in Section 14 of the prompt.
 */
export function getSupabaseMigrationSQL(): string {
  return `-- ====================================================================
-- IMAGE3D STUDIO: SUPABASE DATABASE MIGRATIONS & RLS POLICIES
-- ====================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    storage_used_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'automatic',
    input_image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GENERATION JOBS TABLE
CREATE TABLE IF NOT EXISTS public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploading',
    progress INTEGER DEFAULT 0,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.generation_jobs(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'original_image', 'glb_mesh', 'obj_mesh', 'texture_map', 'blender_project'
    file_format TEXT NOT NULL, -- 'glb', 'obj', 'png', 'blend', 'zip'
    storage_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MODEL VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    source_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    output_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    label TEXT DEFAULT 'Original Generated',
    processing_settings JSONB DEFAULT '{}'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROVIDER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.provider_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_project ON public.generation_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_project ON public.model_versions(project_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own jobs"
    ON public.generation_jobs FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own assets"
    ON public.assets FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own model versions"
    ON public.model_versions FOR ALL USING (
        EXISTS (SELECT 1 FROM public.projects WHERE projects.id = model_versions.project_id AND projects.owner_id = auth.uid())
    );
`;
}
