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

const UPDATE_ERROR_MARKERS = [
    "loading chunk",
    "chunkloaderror",
    "failed to fetch dynamically imported module",
    "error loading dynamically imported module",
    "importing a module script failed",
    "failed to load module script",
    "module script failed to load",
    "expected a javascript module script",
    "non-javascript mime type",
    "unexpected token '<'",
];

type ErrorLike = {
    readonly message?: unknown;
    readonly name?: unknown;
    readonly cause?: unknown;
    readonly reason?: unknown;
    readonly error?: unknown;
};

function pushMessage(messages: string[], value: unknown): void {
    if (!value) return;
    if (typeof value === "string") {
        messages.push(value);
        return;
    }
    if (value instanceof Error) {
        if (value.message) messages.push(value.message);
        if (value.name) messages.push(value.name);
        return;
    }
    if (typeof value === "object") {
        const errorLike = value as ErrorLike;
        if (typeof errorLike.message === "string") messages.push(errorLike.message);
        if (typeof errorLike.name === "string") messages.push(errorLike.name);
    }
}

function getErrorText(error: unknown): string {
    const messages: string[] = [];
    pushMessage(messages, error);

    if (typeof error === "object" && error) {
        const errorLike = error as ErrorLike;
        pushMessage(messages, errorLike.cause);
        pushMessage(messages, errorLike.reason);
        pushMessage(messages, errorLike.error);
    }

    if (messages.length === 0) {
        return String(error).toLowerCase();
    }

    return messages.join(" ").toLowerCase();
}

function isUpdateAvailableMessage(message: string): boolean {
    if (!message) return false;
    return UPDATE_ERROR_MARKERS.some((marker) => message.includes(marker));
}

export function isUpdateAvailableError(error: unknown): boolean {
    if (!error) return false;
    return isUpdateAvailableMessage(getErrorText(error));
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

    const normalizedMessage = getErrorText(error);

    // Detect typical chunk/dynamic import errors after a new deployment
    if (isUpdateAvailableMessage(normalizedMessage)) {
        return {
            title: messages.updateAvailableTitle,
            friendlyMessage: messages.updateAvailable,
        };
    }

    // Detect common data validation errors
    if (
        normalizedMessage.includes("zoderror") ||
        normalizedMessage.includes("validation failed")
    ) {
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
    if (typeof error === 'string') return error;
    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
}
