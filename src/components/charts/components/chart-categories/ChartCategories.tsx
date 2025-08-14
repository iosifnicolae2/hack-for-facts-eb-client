import { useCallback, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input as UITextInput } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Tag, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChartCategory, getChartsStore } from "@/components/charts/chartsStore";
import { t } from "@lingui/core/macro";

type ActiveTab = "all" | "favorites" | `category:${string}`;

type ChartCategoriesProps = {
  readonly categories: readonly ChartCategory[];
  readonly activeTab: ActiveTab;
  onChangeActiveTab: (tab: ActiveTab) => void;
  onCategoriesChange: (next: readonly ChartCategory[]) => void;
  refreshCharts: () => void;
};

const chartsStore = getChartsStore();

export const ChartCategories = memo(function ChartCategories({
  categories,
  activeTab,
  onChangeActiveTab,
  onCategoriesChange,
  refreshCharts,
}: ChartCategoriesProps) {
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isRenameCategoryOpen, setIsRenameCategoryOpen] = useState(false);
  const [renameCategoryId, setRenameCategoryId] = useState<string | null>(null);
  const [renameCategoryName, setRenameCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = useCallback(() => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }
    try {
      const created = chartsStore.createCategory(name);
      onCategoriesChange(chartsStore.loadCategories());
      setIsCreateCategoryOpen(false);
      setNewCategoryName("");
      onChangeActiveTab(`category:${created.id}`);
      toast.success("Category created");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to create category");
    }
  }, [newCategoryName, onCategoriesChange, onChangeActiveTab]);

  const openRenameCategory = useCallback(
    (id: string) => {
      const current = categories.find((c) => c.id === id);
      if (!current) return;
      setRenameCategoryId(id);
      setRenameCategoryName(current.name);
      setIsRenameCategoryOpen(true);
    },
    [categories]
  );

  const submitRenameCategory = useCallback(() => {
    const id = renameCategoryId;
    const name = renameCategoryName.trim();
    if (!id) return;
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }
    chartsStore.renameCategory(id, name);
    onCategoriesChange(chartsStore.loadCategories());
    setIsRenameCategoryOpen(false);
    toast.success("Category renamed");
  }, [renameCategoryId, renameCategoryName, onCategoriesChange]);

  const handleDeleteCategory = useCallback(
    (id: string) => {
      const current = categories.find((c) => c.id === id);
      if (!current) return;
      chartsStore.deleteCategory(id);
      onCategoriesChange(chartsStore.loadCategories());
      refreshCharts();
      if (activeTab === `category:${id}`) onChangeActiveTab("all");
      toast.success("Category deleted");
    },
    [categories, activeTab, onChangeActiveTab, onCategoriesChange, refreshCharts]
  );

  return (
    <>
      {categories.map((cat) => (
        <CategoryTab
          key={cat.id}
          category={cat}
          selected={activeTab === `category:${cat.id}`}
          onRename={() => openRenameCategory(cat.id)}
          onDelete={() => handleDeleteCategory(cat.id)}
          onSelect={() => onChangeActiveTab(`category:${cat.id}`)}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="ml-1 h-7 w-7"
        onClick={() => setIsCreateCategoryOpen(true)}
        aria-label="New category"
        title="New category"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create category</DialogTitle>
            <DialogDescription>
              Group charts with a custom category. You can search by category using #hashtag.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <UITextInput
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.currentTarget.value)}
              placeholder={t`Category name`}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameCategoryOpen} onOpenChange={setIsRenameCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
            <DialogDescription>
              Update the category name. You can still search it with #hashtag.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <UITextInput
              autoFocus
              value={renameCategoryName}
              onChange={(e) => setRenameCategoryName(e.currentTarget.value)}
              placeholder={t`Category name`}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRenameCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

type CategoryTabProps = {
  category: ChartCategory;
  onRename: () => void;
  onDelete: () => void;
  onSelect: () => void;
  selected: boolean;
};

function CategoryTab({ category, selected, onRename, onDelete, onSelect }: CategoryTabProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border-1 rounded-md",
        selected &&
          "bg-white border-slate-200 shadow-md data-[state=active]:bg-white data-[state=active]:border-slate-200 data-[state=active]:shadow-md"
      )}
    >
      <TabsTrigger
        value={`category:${category.id}`}
        className="flex items-center gap-1 h-7 px-2 text-xs data-[state=active]:bg-white data-[state=active]:border-none data-[state=active]:shadow-none"
        onClick={onSelect}
      >
        <Tag className="h-3.5 w-3.5" />
        {category.name}
      </TabsTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1 h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="h-4 w-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Confirm Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cancel</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


