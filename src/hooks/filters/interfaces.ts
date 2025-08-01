import { OptionItem } from "@/lib/hooks/useLineItemsFilter";

export interface LabelStore {
    map: (id: string | number) => string;
    add: (options: OptionItem[]) => void;
    fetch: (ids: (string | number)[], getLabels: GetLabels) => Promise<void>;
}

export type GetLabels = (ids: (string | number)[]) => Promise<Array<{ id: string | number, label: string }>>;
