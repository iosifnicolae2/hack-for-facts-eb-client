
export interface GroupedEconomic {
  code: string;
  name: string;
  amount: number;
}

export interface GroupedFunctional {
  code: string;
  name: string;
  totalAmount: number;
  economics: GroupedEconomic[];
}

export interface GroupedSubchapter {
  code: string; // NN.MM
  name: string;
  totalAmount: number;
  functionals: GroupedFunctional[];
}

export interface GroupedChapter {
  prefix: string;
  description: string;
  totalAmount: number;
  functionals: GroupedFunctional[];
  subchapters?: GroupedSubchapter[]; // Optional. Used for income where we want NN.MM grouping
}
