import React from "react";
import { Keyboard } from "lucide-react";
import { t } from "@lingui/core/macro";

interface ShortcutItem {
  category: string;
  shortcuts: {
    action: string;
    keys: string[];
    description: string;
  }[];
}


export function KeyboardShortcuts() {

  const shortcutsData: ShortcutItem[] = [
    {
      category: t`Navigation`,
      shortcuts: [
        { action: t`Search Entities`, keys: ["Ctrl+K", "⌘K"], description: t`Open entity search dialog` },
        { action: t`Go to Map`, keys: ["Ctrl+M", "⌘M"], description: t`Navigate to map view` },
        { action: t`Go to Entity Table`, keys: ["Ctrl+T", "⌘T"], description: t`Navigate to entity analytics table` },
        { action: t`Go to Chart View`, keys: ["Ctrl+H", "⌘H"], description: t`Navigate to chart view` },
        { action: t`Copy Share Link`, keys: ["Ctrl+S", "⌘S"], description: t`Copy current page URL to clipboard` },
      ],
    },
    {
      category: t`Entity Search`,
      shortcuts: [
        { action: t`Open Search`, keys: ["Ctrl+K", "⌘K"], description: t`Open floating entity search` },
        { action: t`Close Search`, keys: ["Esc"], description: t`Close entity search dialog` },
        { action: t`Focus Income Search`, keys: ["Ctrl+L", "⌘L"], description: t`Focus income search in entity details` },
        { action: t`Focus Expense Search`, keys: ["Ctrl+J", "⌘J"], description: t`Focus expense search in entity details` },
      ],
    },
    {
      category: t`Charts`,
      shortcuts: [
        { action: t`Duplicate Series`, keys: ["Ctrl+D", "⌘D"], description: t`Duplicate selected chart series` },
      ],
    },
    {
      category: t`Map`,
      shortcuts: [
        { action: t`Enable Scroll Zoom`, keys: ["Ctrl", "⌘"], description: t`Temporarily enable scroll wheel zoom` },
      ],
    },
    {
      category: t`Entity Details`,
      shortcuts: [
        { action: t`Focus Year Selector`, keys: ["Ctrl+;"], description: t`Focus year selector in entity details` },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-4 border-b border-border">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Keyboard className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t`Keyboard Shortcuts`}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t`Master the app with these powerful keyboard shortcuts`}
        </p>
      </div>

      {/* Shortcuts by Category */}
      <div className="space-y-6">
        {shortcutsData.map((category) => (
          <div key={category.category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {category.category}
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <div className="grid gap-3">
              {category.shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm text-card-foreground">
                      {shortcut.action}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {shortcut.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm min-w-[28px] justify-center">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs font-medium">
                            {t`or`}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Tip */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="p-1 bg-primary/10 rounded">
            <Keyboard className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-primary">
              {t`Pro Tip`}
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {t`Most shortcuts work on both Windows/Linux (Ctrl) and macOS (⌘). Some shortcuts may conflict with browser defaults.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
