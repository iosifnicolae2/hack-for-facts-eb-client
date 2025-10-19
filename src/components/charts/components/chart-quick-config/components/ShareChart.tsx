import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Link2,
    Image as ImageIcon,
    FileImage,
    Check,
    Share2
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { Trans } from '@lingui/react/macro';
import { useAuth } from '@/lib/auth';
import { ensureShortRedirectUrl } from '@/lib/api/shortLinks';
import { getSiteUrl } from '@/config/env';

export interface ShareChartProps {
    /** Chart ID for generating the share link */
    chartId: string;
    /** Chart title for file naming */
    chartTitle?: string;
    /** Target element ID to capture (defaults to "chart-display-area") */
    targetElementId?: string;
}

type ShareAction = 'png' | 'svg' | 'link' | null;

/**
 * ShareChart component provides functionality to export charts as images
 * or copy shareable links to the clipboard.
 */
export function ShareChart({
    chartTitle = 'chart',
    targetElementId = 'chart-display-area'
}: ShareChartProps) {
    const [loadingAction, setLoadingAction] = useState<ShareAction>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const { isSignedIn } = useAuth();

    // Generate the chart share URL with path and query params
    const shareUrl = window.location.href;

    // Sanitize filename by removing special characters
    const sanitizeFilename = useCallback((filename: string): string => {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }, []);

    // Get the target DOM element for image capture
    const getTargetElement = useCallback((): HTMLElement | null => {
        const element = document.getElementById(targetElementId);
        if (!element) {
            console.error(`Element with ID "${targetElementId}" not found`);
            toast.error('Chart element not found. Please ensure the chart is loaded.');
            return null;
        }

        // Check if element is visible
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            toast.error('Chart is not visible. Please ensure the chart is properly displayed.');
            return null;
        }

        // Wait for any pending renders
        return element;
    }, [targetElementId]);

    // Common options for html-to-image
    const getImageOptions = useCallback(() => ({
        cacheBust: true,
        pixelRatio: Math.min(2, window.devicePixelRatio || 1), // Adaptive DPI based on device
        backgroundColor: '#ffffff',
        filter: (node: HTMLElement) => {
            // Exclude elements that shouldn't be in the export
            const excludeClasses = ['no-export', 'share-button', 'share-chart'];
            return !excludeClasses.some(className => node.classList?.contains(className));
        },
        style: {
            // Ensure consistent rendering
            transform: 'scale(1)',
            transformOrigin: 'top left',
        },
        // Add timeout for complex charts
        timeout: 30000,
        // Handle large charts by limiting dimensions
        maxWidth: 4000,
        maxHeight: 4000,
    }), []);

    // Export chart as PNG
    const handleExportPNG = useCallback(async () => {
        const element = getTargetElement();
        if (!element) return;

        setLoadingAction('png');
        try {
            const dataUrl = await toPng(element, getImageOptions());
            const filename = `${sanitizeFilename(chartTitle)}.png`;

            // Convert data URL to blob for better browser compatibility
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            saveAs(blob, filename);
            toast.success(`Chart exported as ${filename}`);
        } catch (error) {
            console.error('Error exporting PNG:', error);
            toast.error('Failed to export PNG. Please try again.');
        } finally {
            setLoadingAction(null);
        }
    }, [getTargetElement, getImageOptions, chartTitle, sanitizeFilename]);

    // Export chart as SVG
    const handleExportSVG = useCallback(async () => {
        const element = getTargetElement();
        if (!element) return;

        setLoadingAction('svg');

        try {
            // Generate short link for authenticated users and update footer
            const footerLink = element.querySelector('#chart-footer-link') as HTMLAnchorElement | null;
            if (isSignedIn && footerLink) {
                try {
                    const shortLink = await ensureShortRedirectUrl(shareUrl, getSiteUrl());
                    footerLink.href = shortLink;
                } catch (e) {
                    console.error('Short link creation failed for SVG export, using full URL:', e);
                }
            }

            const dataUrl = await toSvg(element, getImageOptions());
            const filename = `${sanitizeFilename(chartTitle)}.svg`;

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            saveAs(blob, filename);
            toast.success(`Chart exported as ${filename}`);
        } catch (error) {
            console.error('Error exporting SVG:', error);
            toast.error('Failed to export SVG. Please try again.');
        } finally {
            setLoadingAction(null);
        }
    }, [getTargetElement, getImageOptions, chartTitle, sanitizeFilename, shareUrl, isSignedIn]);

    // Copy chart link to clipboard
    const handleCopyLink = useCallback(async () => {
        setLoadingAction('link');
        try {
            let linkToCopy = shareUrl;
            if (isSignedIn) {
                try {
                    linkToCopy = await ensureShortRedirectUrl(shareUrl, getSiteUrl());
                } catch (e) {
                    // Fall back to original link if short link creation fails
                    console.error('Short link creation failed, falling back to full URL:', e);
                }
            }

            await navigator.clipboard.writeText(linkToCopy);
            setCopiedLink(true);
            toast.success('Chart link copied to clipboard!');

            // Reset the copied state after 2 seconds
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (error) {
            console.error('Error copying link:', error);
            // Fallback for browsers that don't support clipboard API
            try {
                // Recompute the link to copy in the fallback path
                let fallbackLink = shareUrl;
                if (isSignedIn) {
                    try {
                        fallbackLink = await ensureShortRedirectUrl(shareUrl, getSiteUrl());
                    } catch (e) {
                        console.error('Short link creation failed in fallback, using full URL:', e);
                    }
                }
                const textArea = document.createElement('textarea');
                textArea.value = fallbackLink;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                setCopiedLink(true);
                toast.success('Chart link copied to clipboard!');
                setTimeout(() => setCopiedLink(false), 2000);
            } catch {
                toast.error('Failed to copy link. Please copy manually.');
            }
        } finally {
            setLoadingAction(null);
        }
    }, [shareUrl, isSignedIn]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <Trans>Share Chart</Trans>
                </CardTitle>
                <CardDescription>
                    <Trans>Export as image or share with a link</Trans>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Export Options */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-sm font-medium"><Trans>Export as Image</Trans></span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExportPNG}
                                disabled={loadingAction !== null}
                                className="gap-2 flex-1 sm:flex-none"
                            >
                                <ImageIcon className="h-3 w-3" />
                                PNG
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExportSVG}
                                disabled={loadingAction !== null}
                                className="gap-2 flex-1 sm:flex-none"
                            >
                                <FileImage className="h-3 w-3" />
                                SVG
                            </Button>
                        </div>
                    </div>

                    {/* Share Link */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <span className="text-sm font-medium">
                                <Trans>Share Link</Trans>
                            </span>
                            <Button
                                size="sm"
                                variant={copiedLink ? "default" : "outline"}
                                onClick={handleCopyLink}
                                disabled={loadingAction !== null}
                                className="gap-2 w-full sm:w-auto"
                            >
                                {copiedLink ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                                {copiedLink ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 