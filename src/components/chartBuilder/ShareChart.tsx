import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
    Link2,
    Image as ImageIcon,
    FileImage,
    Check,
    AlertCircle,
    Share2
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

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
    }, [getTargetElement, getImageOptions, chartTitle, sanitizeFilename]);

    // Copy chart link to clipboard
    const handleCopyLink = useCallback(async () => {
        setLoadingAction('link');
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            toast.success('Chart link copied to clipboard!');

            // Reset the copied state after 2 seconds
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (error) {
            console.error('Error copying link:', error);
            // Fallback for browsers that don't support clipboard API
            try {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
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
    }, [shareUrl]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Chart
                </CardTitle>
                <CardDescription>
                    Export as image or share with a link
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Export Options */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className="text-sm font-medium">Export as Image</span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExportPNG}
                                disabled={loadingAction !== null}
                                className="gap-2 flex-1 sm:flex-none"
                            >
                                {loadingAction === 'png' ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <ImageIcon className="h-3 w-3" />
                                )}
                                PNG
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExportSVG}
                                disabled={loadingAction !== null}
                                className="gap-2 flex-1 sm:flex-none"
                            >
                                {loadingAction === 'svg' ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <FileImage className="h-3 w-3" />
                                )}
                                SVG
                            </Button>
                        </div>
                    </div>

                    {/* Share Link */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <span className="text-sm font-medium">Share Link</span>
                            <Button
                                size="sm"
                                variant={copiedLink ? "default" : "outline"}
                                onClick={handleCopyLink}
                                disabled={loadingAction !== null}
                                className="gap-2 w-full sm:w-auto"
                            >
                                {loadingAction === 'link' ? (
                                    <LoadingSpinner size="sm" />
                                ) : copiedLink ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    <Link2 className="h-3 w-3" />
                                )}
                                {copiedLink ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Loading State Info */}
                {loadingAction && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                            {loadingAction === 'png' && 'Generating PNG image...'}
                            {loadingAction === 'svg' && 'Generating SVG image...'}
                            {loadingAction === 'link' && 'Copying link...'}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 