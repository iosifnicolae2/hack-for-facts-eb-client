import { OptionItem } from "@/lib/hooks/useLineItemsFilter";

export interface LabelStore {
    map: (id: string | number) => string;
    add: (options: OptionItem[]) => void;
    fetch: (ids: string[], getLabels: GetLabels) => Promise<void>;
}

export type GetLabels = (ids: string[]) => Promise<Array<{ id: string, label: string }>>;