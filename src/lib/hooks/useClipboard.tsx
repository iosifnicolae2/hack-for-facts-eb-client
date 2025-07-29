import { useEffect } from 'react';

type ClipboardCallback = (text: string | undefined, event: ClipboardEvent) => void;

interface UseClipboardOptions {
    /**
     * Optional callback fired when the user copies content.
     * Receives the copied plain-text and the native ClipboardEvent.
     */
    onCopy?: ClipboardCallback;
    /**
     * Optional callback fired when the user pastes content.
     * Receives the pasted plain-text and the native ClipboardEvent.
     */
    onPaste?: ClipboardCallback;
    /**
     * Optional callback fired when the user cuts content.
     * Receives the cut plain-text and the native ClipboardEvent.
     */
    onCut?: ClipboardCallback;
}

/**
 * React hook to register global listeners for copy and paste events.
 * Handles component lifecycle to add and remove listeners automatically.
 *
 * @param options - An object containing onCopy and onPaste callbacks.
 *
 * @example
 * // In your component:
 * const [text, setText] = useState('');
 *
 * useClipboard({
 * onCopy: (copiedText) => console.log('Copied →', copiedText),
 * onPaste: (pastedText) => {
 * console.log('Pasted →', pastedText);
 * setText(pastedText); // Example: update state with pasted content
 * },
 * });
 */
export function useClipboard({ onCopy, onPaste, onCut }: UseClipboardOptions): void {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleCopy = (event: ClipboardEvent) => {
            const selection = window.getSelection()?.toString();
            onCopy?.(selection, event);
        };

        const handlePaste = (event: ClipboardEvent) => {
            if (!event.clipboardData) return;

            const text = event.clipboardData.getData('text/plain');
            onPaste?.(text, event);
        };

        const handleCut = (event: ClipboardEvent) => {
            onCut?.(event.clipboardData?.getData('text/plain'), event);
        };

        window.addEventListener('copy', handleCopy);
        window.addEventListener('paste', handlePaste);
        window.addEventListener('cut', handleCut);

        return () => {
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('paste', handlePaste);
            window.removeEventListener('cut', handleCut);
        };
    }, [onCopy, onPaste, onCut]);
}