import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { SendErrorAction } from "@/components/sentry/SendErrorAction";
import { SendFeedbackAction } from "@/components/sentry/SendFeedbackAction";
import { useSentryConsent } from "@/hooks/useSentryConsent";
import { t } from "@lingui/core/macro";
import {
    MessageSquare,
    BookOpen,
    Bot,
    Mail,
    LifeBuoy,
    ExternalLink,
    Copy,
    Send,
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";

const SUPPORT_EMAIL = 'contact@devostack.com';

const openInNewTab = (url: string, fallbackMessage: string) => {
    try {
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error("Failed to open new tab:", error);
        toast.info(fallbackMessage);
    }
};

const openMailClient = () => {
    const subject = encodeURIComponent(t`Transparenta.eu – Support`);
    const body = encodeURIComponent(
        t`Hello,\n\nI need help with: \n\nPage: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`
    );
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
};

const copyEmailAddress = async () => {
    try {
        await navigator.clipboard.writeText(SUPPORT_EMAIL);
        toast.success(t`Email address copied to clipboard!`);
    } catch (err) {
        console.error('Failed to copy email: ', err);
        toast.error(t`Failed to copy email address.`);
    }
};


type ActionItem = {
    label: string;
    icon: ReactNode;
    action: () => void;
    isExternal?: boolean;
};

type Action = ActionItem | { type: 'separator' } | { type: 'component'; component: ReactNode };

export function ChatFab(): ReactElement {
    useSentryConsent();

    const helpActions: Action[] = [
        {
            label: t`Read Documentation`,
            icon: <BookOpen className="h-4 w-4" />,
            action: () => openInNewTab('/docs', t`Opening docs...`),
            isExternal: true,
        },
        {
            label: t`Ask AI Assistant`,
            icon: <Bot className="h-4 w-4" />,
            action: () => openInNewTab('https://chatgpt.com/g/g-688a4179389c8191955464fd497b7c5b-transparenta-eu', t`Opening AI Assistant...`),
            isExternal: true,
        },
        { type: 'separator' },
        { type: 'component', component: <SendFeedbackAction /> },
        { type: 'component', component: <SendErrorAction /> },
        { type: 'separator' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={t`Quick actions`}
                    className={clsx(
                        "fixed z-50 bottom-6 left-6 md:right-6 md:left-auto",
                        "inline-flex items-center justify-center",
                        "h-14 w-14 rounded-full",
                        "bg-primary text-primary-foreground",
                        "shadow-lg transition-transform hover:scale-105 hover:bg-primary/90",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className="w-64">
                <DropdownMenuLabel className="flex items-center gap-2 font-semibold">
                    <LifeBuoy className="h-5 w-5" />
                    {t`Need help?`}
                </DropdownMenuLabel>
                <p className="px-2 pb-2 text-sm text-muted-foreground">
                    {t`Find resources, report issues, or get in touch.`}
                </p>
                <DropdownMenuGroup>
                    {helpActions.map((item, index) => {
                        if ('type' in item && item.type === 'separator') {
                            return <DropdownMenuSeparator key={`sep-${index}`} />;
                        }
                        if ('type' in item && item.type === 'component') {
                            return <div key={`comp-${index}`}>{item.component}</div>;
                        }
                        const actionItem = item as ActionItem;
                        return (
                            <DropdownMenuItem key={actionItem.label} onClick={actionItem.action} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {actionItem.icon}
                                    <span>{actionItem.label}</span>
                                </div>
                                {actionItem.isExternal && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                            </DropdownMenuItem>
                        );
                    })}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{t`Contact Support`}</span>
                            </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={openMailClient}>
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>{t`Open Email App`}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={copyEmailAddress}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>{t`Copy Email Address`}</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}