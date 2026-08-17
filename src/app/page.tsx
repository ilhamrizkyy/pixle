import { Gallery } from "@/components/gallery/Gallery";
import { icons } from "@/registry";

/**
 * The public gallery. Server component — it reads the static registry and
 * hands it to the interactive client shell, so the icons are in the HTML for
 * search engines and for the first paint.
 */
export default function IconsPage() {
  return <Gallery icons={icons} />;
}
