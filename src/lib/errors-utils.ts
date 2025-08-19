import { defineMessage } from "@lingui/core/macro";

// Define message descriptors for i18n
export const messages = {
    updateAvailableTitle: defineMessage({
        id: "error.updateAvailableTitle",
        message: "Update Available",
    }),
    updateAvailable: defineMessage({
        id: "error.updateAvailable",
        message: "A new version of the app is available. Please reload the page to get the latest updates.",
    }),
    validationIssue: defineMessage({
        id: "error.validationIssue",
        message: "We couldn't display this page due to a data validation issue.",
    }),
    pageRenderErrorTitle: defineMessage({
        id: "error.pageRenderErrorTitle",
        message: "Page Failed to Load",
    }),
    genericError: defineMessage({
        id: "error.genericError",
        message: "Something went wrong while trying to render this page.",
    }),
};

export interface ClassifiedError {
    title: ReturnType<typeof defineMessage>;
    friendlyMessage: ReturnType<typeof defineMessage>;
}

/**
 * Analyzes an error and classifies it for user-friendly display.
 * @param error The error object to classify.
 * @returns A classified error object with i18n message descriptors.
 */
export function classifyError(error: unknown): ClassifiedError {
    if (!error) {
        return {
            title: messages.pageRenderErrorTitle,
            friendlyMessage: messages.genericError,
        };
    }

    const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

    // Detect typical chunk/dynamic import errors after a new deployment
    if (
        message.includes("loading chunk") ||
        message.includes("chunkloaderror") ||
        message.includes("failed to fetch dynamically imported module")
    ) {
        return {
            title: messages.updateAvailableTitle,
            friendlyMessage: messages.updateAvailable,
        };
    }

    // Detect common data validation errors
    if (message.includes("zoderror") || message.includes("validation failed")) {
        return {
            title: messages.pageRenderErrorTitle,
            friendlyMessage: messages.validationIssue,
        };
    }

    return {
        title: messages.pageRenderErrorTitle,
        friendlyMessage: messages.genericError,
    };
}

/**
 * Gets a developer-focused, technical representation of an error.
 * @param error The error object.
 * @returns A string with technical details, or null if no error is provided.
 */
export function getTechnicalMessage(error: unknown): string | null {
    if (!error) return null;
    if (error instanceof Error) return error.stack || error.message;
    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
}