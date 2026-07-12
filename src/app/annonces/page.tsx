import { permanentRedirect } from "next/navigation";

export default function AnnoncesRedirectPage() {
  permanentRedirect("/articles");
}
