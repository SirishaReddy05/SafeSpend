export type ResourceItem = {
  id: string;
  name: string;
  created_at: string;
  size_bytes: number;
};

export type OcrAction =
  | {
      target: "wallet";
      confidence: number;
      payload: { incomeType?: string; amount?: number | null };
      notes?: string;
    }
  | {
      target: "budget";
      confidence: number;
      payload: {
        name?: string;
        category?: string;
        amount?: number | null;
        period?: "daily" | "weekly" | "monthly" | "yearly";
      };
      notes?: string;
    }
  | {
      target: "unknown";
      confidence: number;
      payload: Record<string, unknown>;
      notes?: string;
    };

export type OcrParseResult = {
  file_name: string;
  extracted_text: string;
  action: OcrAction;
};

const PYTHON_ENGINE_URL = import.meta.env.VITE_PYTHON_ENGINE_URL ?? "/api/python";
const PYTHON_ENGINE_FALLBACK_URL =
  import.meta.env.VITE_PYTHON_ENGINE_FALLBACK_URL ?? "http://127.0.0.1:8000";

function engineUrls(): string[] {
  return Array.from(new Set([PYTHON_ENGINE_URL, PYTHON_ENGINE_FALLBACK_URL]));
}

async function responseError(response: Response, fallback: string): Promise<Error> {
  const text = await response.text().catch(() => "");
  if (!text) {
    return new Error(`${fallback} (${response.status})`);
  }

  try {
    const details = JSON.parse(text);
    const message = details?.detail || details?.message || text;
    return new Error(typeof message === "string" ? message : fallback);
  } catch {
    return new Error(text || fallback);
  }
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function listResources(): Promise<ResourceItem[]> {
  let lastError: Error | undefined;

  for (const baseUrl of engineUrls()) {
    try {
      const response = await fetch(`${baseUrl}/resources`);
      if (!response.ok) {
        throw await responseError(response, "Failed to load resources");
      }
      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Failed to load resources");
    }
  }

  throw lastError ?? new Error("Python engine is not reachable. Start it with `npm run python-engine`.");
}

export async function uploadResource(file: File): Promise<ResourceItem> {
  const dataBase64 = await fileToBase64(file);
  let lastError: Error | undefined;

  for (const baseUrl of engineUrls()) {
    const response = await fetch(`${baseUrl}/resources/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name: file.name,
        data_base64: dataBase64,
      }),
    }).catch((error: unknown) => {
      lastError = error instanceof Error ? error : new Error("Upload failed");
      return undefined;
    });

    if (!response) {
      continue;
    }

    if (!response.ok) {
      lastError = await responseError(response, "Upload failed");
      continue;
    }

    return response.json();
  }

  throw lastError ?? new Error("Upload failed");
}

export async function parseOcrAction(
  file: File,
  instruction: string,
): Promise<OcrParseResult> {
  const dataBase64 = await fileToBase64(file);
  let lastError: Error | undefined;

  for (const baseUrl of engineUrls()) {
    const response = await fetch(`${baseUrl}/ocr/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name: file.name,
        data_base64: dataBase64,
        instruction,
      }),
    }).catch((error: unknown) => {
      lastError = error instanceof Error ? error : new Error("OCR request failed");
      return undefined;
    });

    if (!response) {
      continue;
    }

    if (!response.ok) {
      lastError = await responseError(response, "OCR request failed");
      continue;
    }

    return response.json();
  }

  throw lastError ?? new Error("OCR request failed");
}

export async function deleteResource(resourceId: string): Promise<void> {
  const response = await fetch(`${PYTHON_ENGINE_URL}/resources/${resourceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Delete failed");
  }
}

export async function askResourceAgent(
  question: string,
  resourceIds?: string[],
): Promise<string> {
  let lastError: Error | undefined;

  for (const baseUrl of engineUrls()) {
    const response = await fetch(`${baseUrl}/agent/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        resource_ids: resourceIds,
      }),
    }).catch((error: unknown) => {
      lastError = error instanceof Error ? error : new Error("Agent request failed");
      return undefined;
    });

    if (!response) {
      continue;
    }

    if (!response.ok) {
      lastError = await responseError(response, "Agent request failed");
      continue;
    }

    const data = await response.json();
    return (
      data?.answer ??
      "I could not generate a response from your uploaded resources."
    );
  }

  throw lastError ?? new Error("Agent request failed");
}
