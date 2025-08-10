import type { ReactElement } from "react";
import { Link } from "@tanstack/react-router";
import { Github, Linkedin } from "lucide-react";

/**
 * App-wide footer displayed at the bottom of the main layout.
 *
 * Notes:
 * - Kept lightweight and semantic. Lives inside `SidebarInset` so it naturally
 *   sticks to the bottom when content is short, and pushes below long content.
 * - Uses internal `Link` for app routes and external anchors for resources.
 */
export function AppFooter(): ReactElement {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-muted/30 text-muted-foreground">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">

                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand + short description */}
                    <div className="space-y-3">
                        <div className="font-semibold text-lg text-foreground">Transparenta.eu</div>
                        <p className="text-sm leading-relaxed">
                            Platformă de explorare a datelor financiare publice pentru cetățeni
                            și dezvoltatori.
                        </p>
                        <div className="flex items-center gap-4 pt-1">
                            <a
                                href="https://github.com/"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-2 hover:text-foreground"
                                aria-label="GitHub"
                            >
                                <Github className="h-4 w-4" />
                                <span className="text-sm">GitHub</span>
                            </a>
                            <a
                                href="https://www.linkedin.com/"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-2 hover:text-foreground"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-4 w-4" />
                                <span className="text-sm">LinkedIn</span>
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <nav aria-label="Product" className="space-y-3" aria-labelledby="footer-product-heading">
                        <h2 id="footer-product-heading" className="font-medium text-foreground text-base">Product</h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/charts" className="hover:text-foreground">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/entity-analytics" className="hover:text-foreground">
                                    For Developers
                                </Link>
                            </li>
                            <li>
                                <Link to="/data-discovery" className="hover:text-foreground">
                                    Data Discovery
                                </Link>
                            </li>
                            <li>
                                <Link to="/map" className="hover:text-foreground">
                                    Maps
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Company */}
                    <nav aria-label="Company" className="space-y-3" aria-labelledby="footer-company-heading">
                        <h2 id="footer-company-heading" className="font-medium text-foreground text-base">Company</h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://transparenta.eu"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="hover:text-foreground"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://transparenta.eu/blog"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="hover:text-foreground"
                                >
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:contact@transparenta.eu"
                                    className="hover:text-foreground"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Legal */}
                    <nav aria-label="Legal" className="space-y-3" aria-labelledby="footer-legal-heading">
                        <h2 id="footer-legal-heading" className="font-medium text-foreground text-base">Legal</h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-foreground">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground">Terms of Service</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground">Cookie Policy</a>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Divider */}
                <div className="my-8 h-px w-full bg-border" />

                {/* Data source and copyright */}
                <div className="flex flex-col items-start justify-between gap-4 text-xs text-muted-foreground md:flex-row">
                    <p>
                        Sursa datelor: portalul „Transparența Bugetară” administrat de ANAF/Ministerul
                        Finanțelor, disponibil ca date deschise (Open Data). Vezi resursele oficiale:
                        {" "}
                        <a
                            href="https://mfinante.gov.ro/transparenta-bugetara"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline offset-2 hover:text-foreground"
                        >
                            mfinante.gov.ro/transparenta-bugetara
                        </a>
                        {" "}și{" "}
                        <a
                            href="https://extranet.anaf.mfinante.gov.ro/anaf/extranet/EXECUTIEBUGETARA"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline offset-2 hover:text-foreground"
                        >
                            extranet.anaf.mfinante.gov.ro
                        </a>
                        .
                    </p>
                    <p className="whitespace-nowrap">© {currentYear} Transparenta.eu. Toate drepturile rezervate.</p>
                </div>

                {/* Bottom utilities: Feedback / Status / Back to top */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline hover:text-foreground"
                        >
                            Feedback / Report an issue
                        </a>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="rounded-md border px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
                        aria-label="Înapoi sus"
                    >
                        Back to top
                    </button>
                </div>
            </div>
        </footer>
    );
}


