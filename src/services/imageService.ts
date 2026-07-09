import { generateImage } from "@/lib/ai.functions";

export type ImageStyle = "Realistic" | "Anime" | "Cartoon" | "3D" | "Cyberpunk" | "Fantasy";
export const IMAGE_STYLES: ImageStyle[] = ["Realistic", "Anime", "Cartoon", "3D", "Cyberpunk", "Fantasy"];

export async function generateImageFromPrompt(prompt: string, style?: ImageStyle) {
  return await generateImage({ data: { prompt, style } });
}
